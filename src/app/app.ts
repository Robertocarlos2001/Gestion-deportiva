import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  equipo = "FC Barcelona";
  temporada = "2026-27";

  // En celular el menú lateral está escondido; esta variable dice si está abierto.
  menu_abierto = false;

  alternar_menu() {
    this.menu_abierto = !this.menu_abierto;
  }

  cerrar_menu() {
    this.menu_abierto = false;
  }
}
