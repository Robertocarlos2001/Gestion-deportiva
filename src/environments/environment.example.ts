// Configuracion de tu proyecto de Firebase.
// Reemplaza estos valores por los de TU consola de Firebase:
// Consola Firebase > Configuracion del proyecto > Tus apps > Configuracion del SDK
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROYECTO.firebaseapp.com',
    projectId: 'TU_PROYECTO',
    storageBucket: 'TU_PROYECTO.appspot.com',
    messagingSenderId: 'TU_SENDER_ID',
    appId: 'TU_APP_ID'
  },
  // API de fútbol (Highlightly) para el registro post-partido.
  // Panel y clave: https://highlightly.net · Plan gratis: 100 consultas por día.
  api_futbol: {
    url: 'https://soccer.highlightly.net',
    // Mientras esté vacía, la pantalla muestra datos de ejemplo.
    clave: '',
    // 450963 = FC Barcelona en Highlightly
    id_equipo: 450963,
    // Año en que EMPIEZA la temporada (2026 = temporada 2026-27, la actual)
    temporada: 2026,
    // 119924 = La Liga en Highlightly (la tabla que muestra el Dashboard)
    id_liga: 119924,
    // Minutos que se reutiliza una respuesta guardada antes de volver a pedirla.
    // Evita gastar las 100 consultas diarias al recargar la página.
    minutos_cache: 30
  }
};
