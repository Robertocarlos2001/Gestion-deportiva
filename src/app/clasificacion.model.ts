// Una fila de la tabla de posiciones (llega de la API de fútbol)
export class FilaClasificacion {
  posicion: number = 0;
  equipo: string = "";
  jugados: number = 0;         // PJ
  ganados: number = 0;         // PG
  empatados: number = 0;       // PE
  perdidos: number = 0;        // PP
  goles_favor: number = 0;     // GF
  goles_contra: number = 0;    // GC
  diferencia: number = 0;      // DG = GF - GC
  puntos: number = 0;
  // true si la fila es de nuestro equipo (para resaltarla)
  es_nuestro: boolean = false;
}
