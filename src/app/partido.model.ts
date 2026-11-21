// Datos de un jugador en un partido (llegan de la API de fútbol, no se cargan a mano)
export class JugadorPartido {
  nombre: string = "";
  minutos: number = 0;
  amarillas: number = 0;
  roja: boolean = false;
  goles: number = 0;

  constructor(nombre: string, minutos: number, amarillas: number, roja: boolean, goles: number) {
    this.nombre = nombre;
    this.minutos = minutos;
    this.amarillas = amarillas;
    this.roja = roja;
    this.goles = goles;
  }
}

// Un partido de la temporada (ya jugado o por jugar)
export class Partido {
  // id del partido en la API
  id: number = 0;
  id_competicion: number = 0;
  competicion: string = "";   // La Liga, UEFA Champions League...
  jornada: string = "";       // "Regular Season - 13"
  fecha: string = "";         // formato ISO, ej. 2026-11-08T20:00:00.000Z
  local: string = "";
  visitante: string = "";
  // true si nuestro equipo juega en casa
  somos_local: boolean = false;
  // true si el partido ya se jugó (entonces hay goles)
  terminado: boolean = false;
  goles_local: number = 0;
  goles_visitante: number = 0;
  // Planilla de nuestros jugadores (solo se llena al pedir el detalle del partido)
  jugadores: JugadorPartido[] = [];
  // true cuando son datos inventados (todavía no hay clave de la API)
  es_ejemplo: boolean = false;
}

// Una competición en la que participa el equipo (para las pestañas de Temporada)
export class Competicion {
  id: number = 0;
  nombre: string = "";

  constructor(id: number, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }
}
