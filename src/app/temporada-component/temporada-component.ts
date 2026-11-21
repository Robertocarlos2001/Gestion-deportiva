import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';
import { PartidosService } from '../partidos.service';
import { Competicion, Partido } from '../partido.model';
import { FilaClasificacion } from '../clasificacion.model';

@Component({
  imports: [DatePipe],
  selector: 'app-temporada-component',
  styleUrl: './temporada-component.css',
  templateUrl: './temporada-component.html',
})
export class TemporadaComponent {
  // Signals: al hacer .set(...) Angular vuelve a dibujar la pantalla. En el HTML se leen con ().
  competiciones = signal<Competicion[]>([]);       // las pestañas
  id_competicion_elegida = signal(environment.api_futbol.id_liga);
  clasificacion = signal<FilaClasificacion[]>([]);
  proximos = signal<Partido[]>([]);                // próximos partidos (todas las competiciones)
  resultados = signal<Partido[]>([]);              // últimos partidos jugados
  cargando = signal(false);
  mensaje_error = signal('');

  constructor(private partidos_service: PartidosService) {
    this.cargar_partidos();
    this.cargar_clasificacion();
  }

  // Trae los partidos de la temporada y de ahí saca pestañas, próximos y resultados
  cargar_partidos() {
    this.partidos_service.obtener_partidos_temporada().subscribe({
      next: (partidos) => {
        this.competiciones.set(this.sacar_competiciones(partidos));
        // Los 5 primeros que todavía no se jugaron
        this.proximos.set(partidos.filter((partido) => !partido.terminado).slice(0, 5));
        // Los 5 últimos ya jugados, del más reciente al más antiguo
        this.resultados.set(partidos.filter((partido) => partido.terminado).slice(-5).reverse());
      },
      error: (error) => this.mensaje_error.set(error.message),
    });
  }

  // Trae la tabla de posiciones de la competición elegida
  cargar_clasificacion() {
    this.cargando.set(true);
    this.partidos_service.obtener_clasificacion(this.id_competicion_elegida()).subscribe({
      next: (filas) => {
        this.clasificacion.set(filas);
        this.cargando.set(false);
      },
      error: (error) => {
        this.mensaje_error.set(error.message);
        this.cargando.set(false);
      },
    });
  }

  // Al tocar una pestaña: se cambia la competición y se pide su tabla
  elegir_competicion(id_competicion: number) {
    this.id_competicion_elegida.set(id_competicion);
    this.cargar_clasificacion();
  }

  // Botón "Actualizar": borra lo guardado en el navegador y vuelve a pedir todo
  actualizar() {
    this.mensaje_error.set('');
    this.partidos_service.borrar_cache();
    this.cargar_partidos();
    this.cargar_clasificacion();
  }

  // Devuelve el resultado visto desde nuestro equipo: 'G' ganó, 'E' empató, 'P' perdió
  resultado_de(partido: Partido): string {
    const nuestros = partido.somos_local ? partido.goles_local : partido.goles_visitante;
    const rivales = partido.somos_local ? partido.goles_visitante : partido.goles_local;
    if (nuestros > rivales) {
      return 'G';
    }
    if (nuestros < rivales) {
      return 'P';
    }
    return 'E';
  }

  // Arma la lista de competiciones (sin repetir) a partir de los partidos
  private sacar_competiciones(partidos: Partido[]): Competicion[] {
    const lista: Competicion[] = [];
    for (const partido of partidos) {
      const ya_esta = lista.some((competicion) => competicion.id == partido.id_competicion);
      if (!ya_esta) {
        lista.push(new Competicion(partido.id_competicion, partido.competicion));
      }
    }
    // La liga principal va primero, para que su pestaña quede a la izquierda
    lista.sort((a, b) => (a.id == environment.api_futbol.id_liga ? -1 : b.id == environment.api_futbol.id_liga ? 1 : 0));
    return lista;
  }
}
