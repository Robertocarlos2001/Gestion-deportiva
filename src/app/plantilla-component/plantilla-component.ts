import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartidosService } from '../partidos.service';
import { JugadorPlantilla } from '../jugador.model';

@Component({
  imports: [RouterLink],
  selector: 'app-plantilla-component',
  styleUrl: './plantilla-component.css',
  templateUrl: './plantilla-component.html',
})
export class PlantillaComponent {
  // Signals: al hacer .set(...) Angular vuelve a dibujar la pantalla. En el HTML se leen con ().
  jugadores = signal<JugadorPlantilla[]>([]);
  cargando = signal(false);
  mensaje_error = signal('');

  constructor(private partidos_service: PartidosService) {
    this.cargar_plantilla();
  }

  // Trae la plantilla actual (convocados en los últimos partidos)
  cargar_plantilla() {
    this.cargando.set(true);
    this.mensaje_error.set('');

    this.partidos_service.obtener_plantilla().subscribe({
      next: (jugadores) => {
        this.jugadores.set(jugadores);
        this.cargando.set(false);
      },
      error: (error) => {
        this.mensaje_error.set(error.message);
        this.cargando.set(false);
      },
    });
  }

  // Botón "Actualizar": borra lo guardado en el navegador y vuelve a pedir
  actualizar() {
    this.partidos_service.borrar_cache();
    this.cargar_plantilla();
  }
}
