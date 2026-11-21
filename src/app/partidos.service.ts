import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ApiFutbolDataServices } from './api-futbol.data.services';
import { JugadorPartido, Partido } from './partido.model';
import { FilaClasificacion } from './clasificacion.model';
import { JugadorPlantilla } from './jugador.model';

// SERVICIO INTERMEDIO: los componentes le piden datos a este servicio,
// y este se los pide a la capa de datos (api-futbol.data.services).
// Aquí se traduce la respuesta de la API (en inglés y con muchos campos)
// a nuestros modelos Partido, JugadorPartido y FilaClasificacion.
@Injectable({ providedIn: 'root' })
export class PartidosService {
  constructor(private api_futbol: ApiFutbolDataServices) {}

  // Todos los partidos de la temporada (jugados y por jugar), del más antiguo al más nuevo.
  // Son 2 peticiones a la API: partidos de local y partidos de visitante.
  obtener_partidos_temporada(): Observable<Partido[]> {
    // Sin clave no se puede llamar a la API: devolvemos datos de ejemplo
    if (!this.api_futbol.tiene_clave()) {
      return of(this.partidos_de_ejemplo());
    }

    // forkJoin: lanza las dos peticiones a la vez y espera a que lleguen ambas
    return forkJoin([
      this.api_futbol.obtener_partidos_local(),
      this.api_futbol.obtener_partidos_visitante(),
    ]).pipe(
      map(([de_local, de_visitante]) => {
        // Se juntan las dos listas en una sola y se convierte cada partido
        const todos = [...de_local.data, ...de_visitante.data];
        const partidos = todos.map((item) => this.convertir_partido(item));
        // Las fechas son texto ISO, que se puede ordenar alfabéticamente
        partidos.sort((a, b) => a.fecha.localeCompare(b.fecha));
        return partidos;
      }),
      // Si algo falla, se cambia el error técnico por un mensaje entendible
      catchError((error) => throwError(() => new Error(this.explicar_error(error))))
    );
  }

  // El último partido jugado, con la planilla de nuestros jugadores.
  // Suma 1 petición más: los jugadores de ese partido.
  obtener_ultimo_partido(): Observable<Partido> {
    return this.obtener_partidos_temporada().pipe(
      // switchMap: con la lista de partidos, se hace la siguiente petición
      switchMap((partidos) => {
        const terminados = partidos.filter((partido) => partido.terminado);
        if (terminados.length == 0) {
          throw new Error('Todavía no hay partidos terminados en esta temporada.');
        }
        // La lista está ordenada por fecha: el último es el más reciente
        const ultimo = terminados[terminados.length - 1];

        // Los datos de ejemplo ya traen sus jugadores
        if (ultimo.es_ejemplo) {
          return of(ultimo);
        }
        return this.api_futbol.obtener_jugadores_partido(ultimo.id).pipe(
          map((respuesta) => {
            ultimo.jugadores = this.convertir_jugadores(respuesta);
            return ultimo;
          })
        );
      }),
      catchError((error) => throwError(() => new Error(this.explicar_error(error))))
    );
  }

  // Tabla de posiciones de una competición. Es 1 petición a la API.
  obtener_clasificacion(id_competicion: number): Observable<FilaClasificacion[]> {
    if (!this.api_futbol.tiene_clave()) {
      return of(this.clasificacion_de_ejemplo());
    }

    return this.api_futbol.obtener_clasificacion(id_competicion).pipe(
      map((respuesta) => {
        // La API agrupa la tabla en "groups" (las ligas tienen un solo grupo)
        const grupos = respuesta.groups ?? [];
        if (grupos.length == 0) {
          return [];
        }
        return grupos[0].standings.map((item: any) => this.convertir_fila(item));
      }),
      catchError((error) => throwError(() => new Error(this.explicar_error(error))))
    );
  }

  // La plantilla actual del equipo. La API no tiene una lista de plantilla,
  // así que se arma juntando las convocatorias de los últimos 3 partidos jugados
  // (titulares y suplentes). Suma hasta 3 peticiones, una por partido.
  obtener_plantilla(): Observable<JugadorPlantilla[]> {
    return this.obtener_partidos_temporada().pipe(
      switchMap((partidos) => {
        const ultimos = partidos.filter((partido) => partido.terminado).slice(-3);
        if (ultimos.length == 0) {
          return of([]);
        }
        // Los datos de ejemplo no tienen convocatoria en la API: se usan sus jugadores
        if (ultimos[0].es_ejemplo) {
          return of(this.plantilla_de_ejemplo(ultimos[0]));
        }
        // forkJoin: pide las convocatorias de los 3 partidos a la vez
        const peticiones = ultimos.map((partido) => this.api_futbol.obtener_jugadores_partido(partido.id));
        return forkJoin(peticiones).pipe(map((respuestas) => this.juntar_convocatorias(respuestas)));
      }),
      catchError((error) => throwError(() => new Error(this.explicar_error(error))))
    );
  }

  // Borra lo guardado en el navegador: la próxima consulta va directo a la API
  borrar_cache() {
    this.api_futbol.borrar_cache();
  }

  // Convierte un error en un texto para mostrar en pantalla
  private explicar_error(error: any): string {
    if (error instanceof HttpErrorResponse) {
      // status 0: el navegador no recibió respuesta (sin internet)
      if (error.status == 0) {
        return 'No hubo respuesta de la API. Revisa tu conexión a internet.';
      }
      // 401 / 403: la API no aceptó la clave
      if (error.status == 401 || error.status == 403) {
        return 'La API rechazó la clave. Revisa el campo "clave" en environment.ts.';
      }
      // 429: se pasó el límite de consultas (100 por día en el plan gratis)
      if (error.status == 429) {
        return 'Se alcanzó el límite de consultas de la API por hoy. Intenta de nuevo mañana.';
      }
      return 'La API respondió con el error ' + error.status + '.';
    }
    return error.message;
  }

  // Convierte un partido de la API a nuestro modelo
  private convertir_partido(item: any): Partido {
    const partido = new Partido();
    partido.id = item.id;
    partido.id_competicion = item.league.id;
    partido.competicion = item.league.name;
    partido.jornada = item.round;
    partido.fecha = item.date;
    partido.local = item.homeTeam.name;
    partido.visitante = item.awayTeam.name;
    partido.somos_local = item.homeTeam.id == environment.api_futbol.id_equipo;
    // "Finished" o "Finished after penalties": el partido ya terminó
    partido.terminado = item.state.description.startsWith('Finished');

    // El marcador llega como texto "1 - 2" (o null si no se jugó): se separa en dos números
    const marcador = (item.state.score.current ?? '0 - 0').split(' - ');
    partido.goles_local = Number(marcador[0]);
    partido.goles_visitante = Number(marcador[1]);
    return partido;
  }

  // Convierte una fila de la tabla de posiciones de la API a nuestro modelo
  private convertir_fila(item: any): FilaClasificacion {
    const fila = new FilaClasificacion();
    fila.posicion = item.position;
    fila.equipo = item.team.name;
    fila.jugados = item.total.games;
    fila.ganados = item.total.wins;
    fila.empatados = item.total.draws;
    fila.perdidos = item.total.loses;
    fila.goles_favor = item.total.scoredGoals;
    fila.goles_contra = item.total.receivedGoals;
    fila.diferencia = fila.goles_favor - fila.goles_contra;
    fila.puntos = item.points;
    fila.es_nuestro = item.team.id == environment.api_futbol.id_equipo;
    return fila;
  }

  // Convierte los jugadores de la API a nuestro modelo.
  // La respuesta trae los dos equipos: se busca el nuestro por su id.
  private convertir_jugadores(equipos: any[]): JugadorPartido[] {
    const nuestro = (equipos ?? []).find((item) => item.team.id == environment.api_futbol.id_equipo);
    if (!nuestro) {
      return [];
    }
    const jugadores: JugadorPartido[] = [];
    for (const item of nuestro.players) {
      const minutos = item.minutesPlayed ?? 0;
      // Los suplentes que no entraron vienen con 0 minutos: no se listan
      if (minutos > 0) {
        const estadisticas = item.statistics ?? {};
        // Roja directa o por doble amarilla
        const fue_expulsado = (estadisticas.cardsRed ?? 0) > 0 || (estadisticas.cardsSecondYellow ?? 0) > 0;
        jugadores.push(
          new JugadorPartido(
            item.name,
            minutos,
            estadisticas.cardsYellow ?? 0,
            fue_expulsado,
            estadisticas.goalsScored ?? 0
          )
        );
      }
    }
    return jugadores;
  }

  // Junta las convocatorias de varios partidos en una sola lista sin jugadores repetidos
  private juntar_convocatorias(respuestas: any[]): JugadorPlantilla[] {
    const plantilla: JugadorPlantilla[] = [];
    for (const equipos of respuestas) {
      const nuestro = (equipos ?? []).find((item: any) => item.team.id == environment.api_futbol.id_equipo);
      if (!nuestro) {
        continue; // este partido no trae convocatoria: se pasa al siguiente
      }
      for (const item of nuestro.players) {
        // Si el jugador ya está en la lista se actualiza; si no, se agrega
        let jugador = plantilla.find((j) => j.id_api == item.id);
        if (!jugador) {
          jugador = new JugadorPlantilla();
          jugador.id_api = item.id;
          jugador.nombre = item.name;
          jugador.posicion = this.traducir_posicion(item.position);
          jugador.dorsal = item.shirtNumber ?? 0;
          plantilla.push(jugador);
        }
        jugador.convocatorias = jugador.convocatorias + 1;
        jugador.minutos_recientes = jugador.minutos_recientes + (item.minutesPlayed ?? 0);
      }
    }
    // Orden: porteros, defensas, medios, delanteros; dentro de cada grupo, por dorsal
    const orden = ['POR', 'DEF', 'MED', 'DEL'];
    plantilla.sort((a, b) => orden.indexOf(a.posicion) - orden.indexOf(b.posicion) || a.dorsal - b.dorsal);
    return plantilla;
  }

  // La API manda la posición en inglés
  private traducir_posicion(posicion: string): string {
    if (posicion == 'Goalkeeper') return 'POR';
    if (posicion == 'Defender') return 'DEF';
    if (posicion == 'Midfielder') return 'MED';
    if (posicion == 'Forward') return 'DEL';
    return '–';
  }

  // ---------- Datos inventados para ver las pantallas mientras no hay clave ----------

  private plantilla_de_ejemplo(partido: Partido): JugadorPlantilla[] {
    return partido.jugadores.map((item, indice) => {
      const jugador = new JugadorPlantilla();
      jugador.id_api = indice + 1;
      jugador.nombre = item.nombre;
      jugador.posicion = '–';
      jugador.dorsal = indice + 1;
      jugador.convocatorias = 1;
      jugador.minutos_recientes = item.minutos;
      return jugador;
    });
  }

  private partidos_de_ejemplo(): Partido[] {
    const jugado = new Partido();
    jugado.id_competicion = environment.api_futbol.id_liga;
    jugado.competicion = 'La Liga';
    jugado.jornada = 'Regular Season - 12';
    jugado.fecha = '2026-11-08T20:00:00.000Z';
    jugado.local = 'Barcelona';
    jugado.visitante = 'Girona';
    jugado.somos_local = true;
    jugado.terminado = true;
    jugado.goles_local = 2;
    jugado.goles_visitante = 1;
    jugado.es_ejemplo = true;
    jugado.jugadores = [
      new JugadorPartido('Joan García', 90, 0, false, 0),
      new JugadorPartido('Koundé', 90, 1, false, 0),
      new JugadorPartido('Cubarsí', 90, 0, false, 0),
      new JugadorPartido('De Jong', 75, 0, false, 0),
      new JugadorPartido('Pedri', 90, 1, false, 0),
      new JugadorPartido('Raphinha', 82, 0, false, 1),
      new JugadorPartido('Lewandowski', 90, 0, false, 1),
      new JugadorPartido('Yamal', 90, 0, false, 0),
    ];

    const proximo = new Partido();
    proximo.id_competicion = environment.api_futbol.id_liga;
    proximo.competicion = 'La Liga';
    proximo.jornada = 'Regular Season - 13';
    proximo.fecha = '2026-11-22T13:00:00.000Z';
    proximo.local = 'Villarreal';
    proximo.visitante = 'Barcelona';
    proximo.es_ejemplo = true;

    return [jugado, proximo];
  }

  private clasificacion_de_ejemplo(): FilaClasificacion[] {
    const datos = [
      ['Barcelona', 12, 10, 1, 1, 34, 12],
      ['Real Madrid', 12, 9, 3, 0, 29, 11],
      ['Atlético Madrid', 12, 8, 2, 2, 24, 13],
    ];
    return datos.map((dato: any[], indice) => {
      const fila = new FilaClasificacion();
      fila.posicion = indice + 1;
      fila.equipo = dato[0];
      fila.jugados = dato[1];
      fila.ganados = dato[2];
      fila.empatados = dato[3];
      fila.perdidos = dato[4];
      fila.goles_favor = dato[5];
      fila.goles_contra = dato[6];
      fila.diferencia = dato[5] - dato[6];
      fila.puntos = dato[2] * 3 + dato[3];
      fila.es_nuestro = indice == 0;
      return fila;
    });
  }
}
