import {
  ApplicationConfig,
  LOCALE_ID,
  APP_INITIALIZER,
  provideZoneChangeDetection,
} from '@angular/core';
import es from '@angular/common/locales/es';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { AutenticacionService } from './services/autenticacion.service';

registerLocaleData(es);

// Inicializador de la aplicación para cargar el perfil del usuario
export function initializeAppFn(authService: AutenticacionService) {
  return () => {
    console.log('[initializeAppFn] Iniciando inicialización de la aplicación');
    return authService.getInitialization().then(() => {
      console.log('[initializeAppFn] Inicialización completada');
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFn,
      deps: [AutenticacionService],
      multi: true,
    },
  ],
};
