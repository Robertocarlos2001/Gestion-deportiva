import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Para que las fechas salgan en español ("dom 22 nov" en vez de "Sun 22 Nov")
registerLocaleData(localeEs);

// NOTA: los proveedores de Firebase se agregarán en la etapa de backend.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Permite usar HttpClient para consumir la API de fútbol
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};
