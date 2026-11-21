import { Component } from '@angular/core';
import { RegistroEntrenamientoComponent } from '../registro-entrenamiento-component/registro-entrenamiento-component';
import { RegistroPartidoComponent } from '../registro-partido-component/registro-partido-component';

// Pantalla única de registro: un interruptor elige si se ve
// el registro de entrenamiento o el registro post-partido.
@Component({
  imports: [RegistroEntrenamientoComponent, RegistroPartidoComponent],
  selector: 'app-registro-component',
  styleUrl: './registro-component.css',
  templateUrl: './registro-component.html',
})
export class RegistroComponent {
  // Vale 'entrenamiento' o 'partido'. Arranca en entrenamiento.
  modo = 'entrenamiento';

  cambiar_modo(nuevo_modo: string) {
    this.modo = nuevo_modo;
  }
}
