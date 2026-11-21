import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PartidosService } from '../partidos.service';
import { Partido } from '../partido.model';

@Component({
  imports: [DatePipe],
  selector: 'app-registro-partido-component',
  styleUrl: './registro-partido-component.css',
  templateUrl: './registro-partido-component.html',
})
export class RegistroPartidoComponent {
  // Se usan "signals" porque los datos llegan más tarde (cuando responde la API):
  // al hacer .set(...) Angular vuelve a dibujar la pantalla. En el HTML se leen con ().
  partido = signal<Partido | null>(null);
  cargando = signal(false);
  mensaje_error = signal('');

  constructor(private partidos_service: PartidosService) {
    this.cargar_partido();
  }

  // Botón "Actualizar desde la API": borra lo guardado en el navegador y vuelve a pedir
  actualizar_partido() {
    this.partidos_service.borrar_cache();
    this.cargar_partido();
  }

  // Pide el último partido al servicio.
  cargar_partido() {
    this.cargando.set(true);
    this.mensaje_error.set('');

    this.partidos_service.obtener_ultimo_partido().subscribe({
      next: (partido) => {
        this.partido.set(partido);
        this.cargando.set(false);
      },
      error: (error) => {
        // error.message trae el motivo (sin internet, clave inválida, límite diario...)
        this.mensaje_error.set(error.message);
        this.cargando.set(false);
      },
    });
  }
}
