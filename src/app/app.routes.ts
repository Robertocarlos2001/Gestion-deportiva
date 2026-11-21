import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard-component/dashboard-component';
import { PlantillaComponent } from './plantilla-component/plantilla-component';
import { JugadorDetalleComponent } from './jugador-detalle-component/jugador-detalle-component';
import { TemporadaComponent } from './temporada-component/temporada-component';
import { PizarraComponent } from './pizarra-component/pizarra-component';
import { LesionesComponent } from './lesiones-component/lesiones-component';
import { ErrorPersonalizado } from './error-personalizado/error-personalizado';
import { RegistroComponent } from './registro-component/registro-component';

export const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "plantilla", component: PlantillaComponent },
  { path: "jugador/:id", component: JugadorDetalleComponent },
  { path: "temporada", component: TemporadaComponent },
  { path: "pizarra", component: PizarraComponent },
  { path: "registro", component: RegistroComponent },
  { path: "registro-entrenamiento", redirectTo: "registro" },
  { path: "registro-partido", redirectTo: "registro" },
  { path: "lesiones", component: LesionesComponent },
  { path: '**', component: ErrorPersonalizado }
];  
