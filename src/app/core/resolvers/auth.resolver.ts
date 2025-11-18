import { Injectable, inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthResolver {
  private authService = inject(AutenticacionService);

  resolve: ResolveFn<UserProfile | null> = async (route, state) => {
    console.log('[AuthResolver] resolve() called for:', state.url);
    
    // Esperar a que se complete la inicialización de autenticación
    console.log('[AuthResolver] Esperando inicialización...');
    await this.authService.getInitialization();
    
    console.log('[AuthResolver] Inicialización completada');
    return this.authService.currentUserValue;
  };
}
