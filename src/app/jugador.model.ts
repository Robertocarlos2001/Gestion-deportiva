export class Jugador {
  // id del registro en Firebase (lo asigna Firebase al crear)
  id?: string;
  nombre: string = "";
  apellido: string = "";
  posicion: string = "";
  dorsal: number = 0;
  // 'activo' = entrena con el equipo · 'cedido' = prestado a otro club.
  // A los cedidos no se les registra carga ni se les calcula el ACWR.
  estado: string = "activo";
  // Club donde está cedido (vacío si el jugador está activo)
  club_cesion: string = "";

  constructor(
    nombre: string,
    apellido: string,
    posicion: string,
    dorsal: number,
    estado: string = "activo",
    club_cesion: string = ""
  ) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.posicion = posicion;
    this.dorsal = dorsal;
    this.estado = estado;
    this.club_cesion = club_cesion;
  }
}

// Un jugador de la plantilla tal como llega de la API de fútbol.
// Se arma con las convocatorias de los últimos partidos, por eso
// no incluye a los cedidos a otros clubes (no son convocados).
export class JugadorPlantilla {
  id_api: number = 0;            // id del jugador en la API
  nombre: string = "";
  posicion: string = "";         // POR, DEF, MED o DEL
  dorsal: number = 0;
  convocatorias: number = 0;     // en cuántos de los últimos partidos estuvo convocado
  minutos_recientes: number = 0; // minutos jugados en esos partidos
}
