// Sesion diaria de entrenamiento o partido (metodo Foster / Sesion-RPE)
export class Sesion {
  // id del documento en Firestore
  id?: string;
  jugadorId: string = "";
  fecha: string = "";        // formato YYYY-MM-DD
  duration: number = 0;      // minutos de la sesion
  rpe: number = 0;           // escala de Borg modificada 1-10
  daily_load: number = 0;    // carga diaria = duration * rpe (UA)

  constructor(jugadorId: string, fecha: string, duration: number, rpe: number) {
    this.jugadorId = jugadorId;
    this.fecha = fecha;
    this.duration = duration;
    this.rpe = rpe;
    this.daily_load = duration * rpe;
  }
}
