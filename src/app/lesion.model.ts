// Historial de lesiones del jugador (para modular el riesgo)
export class Lesion {
  // id del documento en Firestore
  id?: string;
  jugadorId: string = "";
  tipo: string = "";          // muscular, ligamentosa, osea, tendinosa...
  zonaCorporal: string = "";  // isquiotibiales, rodilla, tobillo, aductores... (el "donde")
  lado: string = "";          // izquierdo / derecho
  fecha: string = "";         // formato YYYY-MM-DD
  diasBaja: number = 0;       // dias que estuvo fuera
  contexto: string = "";      // entrenamiento / partido

  constructor(
    jugadorId: string,
    tipo: string,
    zonaCorporal: string,
    lado: string,
    fecha: string,
    diasBaja: number,
    contexto: string
  ) {
    this.jugadorId = jugadorId;
    this.tipo = tipo;
    this.zonaCorporal = zonaCorporal;
    this.lado = lado;
    this.fecha = fecha;
    this.diasBaja = diasBaja;
    this.contexto = contexto;
  }
}
