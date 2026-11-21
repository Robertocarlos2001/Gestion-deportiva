import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';


@Injectable({ providedIn: 'root' })
export class ApiFutbolDataServices {
  private http = inject(HttpClient);

  private url = environment.api_futbol.url;

  // La API pide la clave en esta cabecera en cada petición
  private cabeceras = { 'x-rapidapi-key': environment.api_futbol.clave };

  // Todo lo que se guarda en el navegador empieza con este texto
  private prefijo_cache = 'api_futbol:';

  // true si ya se puso la clave en environment.ts
  tiene_clave(): boolean {
    return environment.api_futbol.clave != '';
  }


  // Partidos de la temporada en los que nuestro equipo juega de local
  obtener_partidos_local(): Observable<any> {
    return this.pedir('/matches', {
      homeTeamId: environment.api_futbol.id_equipo,
      season: environment.api_futbol.temporada,
    });
  }

  // Partidos de la temporada en los que nuestro equipo juega de visitante
  obtener_partidos_visitante(): Observable<any> {
    return this.pedir('/matches', {
      awayTeamId: environment.api_futbol.id_equipo,
      season: environment.api_futbol.temporada,
    });
  }

  // Estadísticas de cada jugador en un partido (la API lo llama "box score").
  // Devuelve los dos equipos; el servicio intermedio se queda con el nuestro.
  obtener_jugadores_partido(id_partido: number): Observable<any> {
    return this.pedir('/box-score/' + id_partido, {});
  }

  // Tabla de posiciones de una competición en la temporada configurada
  obtener_clasificacion(id_competicion: number): Observable<any> {
    return this.pedir('/standings', {
      leagueId: id_competicion,
      season: environment.api_futbol.temporada,
    });
  }

  // Borra lo guardado en el navegador para que la próxima consulta vaya a la API
  borrar_cache() {
    for (const clave of Object.keys(localStorage)) {
      if (clave.startsWith(this.prefijo_cache)) {
        localStorage.removeItem(clave);
      }
    }
  }

  // Hace la petición GET, pero antes mira si ya tiene una respuesta reciente
  // guardada en el navegador (localStorage). Así no se gastan las 100 consultas
  // diarias del plan gratis cada vez que se recarga la página.
  private pedir(ruta: string, parametros: any): Observable<any> {
    const clave_cache = this.prefijo_cache + ruta + JSON.stringify(parametros);

    const guardado = localStorage.getItem(clave_cache);
    if (guardado) {
      const { hora, datos } = JSON.parse(guardado);
      const minutos_pasados = (Date.now() - hora) / 60000;
      if (minutos_pasados < environment.api_futbol.minutos_cache) {
        // of(...) devuelve los datos guardados como si fueran la respuesta
        return of(datos);
      }
    }

    return this.http.get(this.url + ruta, { headers: this.cabeceras, params: parametros }).pipe(
      // tap: cuando llega la respuesta, se guarda junto con la hora actual
      tap((datos) => {
        try {
          localStorage.setItem(clave_cache, JSON.stringify({ hora: Date.now(), datos: datos }));
        } catch {
          // Si el navegador no deja guardar (almacenamiento lleno), se sigue sin caché
        }
      })
    );
  }
}
