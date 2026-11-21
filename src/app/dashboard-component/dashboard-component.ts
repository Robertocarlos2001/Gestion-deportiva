import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { PartidosService } from '../partidos.service';
import { Partido } from '../partido.model';
import { FilaClasificacion } from '../clasificacion.model';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-dashboard-component',
  styleUrl: './dashboard-component.css',
  templateUrl: './dashboard-component.html',
})
export class DashboardComponent {
  // Signals: al hacer .set(...) Angular vuelve a dibujar la pantalla. En el HTML se leen con ().
  primeros = signal<FilaClasificacion[]>([]);             // los 5 primeros de la liga
  nuestra_fila = signal<FilaClasificacion | null>(null);  // la fila de nuestro equipo (para los KPIs)
  proximo_partido = signal<Partido | null>(null);
  mensaje_error = signal('');

  constructor(private partidos_service: PartidosService) {
    this.cargar_clasificacion();
    this.cargar_proximo_partido();
  }

  cargar_clasificacion() {
    this.partidos_service.obtener_clasificacion(environment.api_futbol.id_liga).subscribe({
      next: (filas) => {
        this.primeros.set(filas.slice(0, 5));
        // find devuelve undefined si no la encuentra; "?? null" lo convierte en null
        this.nuestra_fila.set(filas.find((fila) => fila.es_nuestro) ?? null);
      },
      error: (error) => this.mensaje_error.set(error.message),
    });
  }

  cargar_proximo_partido() {
    this.partidos_service.obtener_partidos_temporada().subscribe({
      next: (partidos) => {
        // La lista viene ordenada por fecha: el primero sin jugar es el próximo
        this.proximo_partido.set(partidos.find((partido) => !partido.terminado) ?? null);
      },
      error: (error) => this.mensaje_error.set(error.message),
    });
  }
}
