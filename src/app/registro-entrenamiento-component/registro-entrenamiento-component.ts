import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartidosService } from '../partidos.service';
import { JugadorPlantilla } from '../jugador.model';

@Component({
  imports: [FormsModule],
  selector: 'app-registro-entrenamiento-component',
  styleUrl: './registro-entrenamiento-component.css',
  templateUrl: './registro-entrenamiento-component.html',
})
export class RegistroEntrenamientoComponent {
  // Jugadores de la plantilla actual (llegan de la API). En el HTML se leen con ().
  jugadores = signal<JugadorPlantilla[]>([]);
  mensaje_error = signal('');

  // Duración estándar de la sesión: se aplica a todos los jugadores de la planilla
  duracion_estandar = 90;

  constructor(private partidos_service: PartidosService) {
    this.cargar_jugadores();
  }

  cargar_jugadores() {
    this.partidos_service.obtener_plantilla().subscribe({
      next: (jugadores) => this.jugadores.set(jugadores),
      error: (error) => this.mensaje_error.set(error.message),
    });
  }
}
