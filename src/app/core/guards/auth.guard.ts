import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { take } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AutenticacionService);
  const router = inject(Router);

  console.log('[authGuard] Evaluando acceso a:', state.url);

  // Verificar si el usuario está autenticado
  return authService.isLoggedIn$.pipe(
    take(1), // Tomamos solo el primer valor emitido
    map(isLoggedIn => {
      console.log('[authGuard] isLoggedIn observable value:', isLoggedIn);
      
      if (isLoggedIn) {
        console.log('[authGuard] Usuario autenticado, permitiendo acceso');
        return true;
      } else {
        // Fallback: si hay token en localStorage y no está expirado, permitir acceso
        const token = authService.getToken();
        console.log('[authGuard] Fallback: verificando token en localStorage:', token ? 'presente' : 'ausente');
        
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const now = Date.now() / 1000;
            console.log('[authGuard] Token exp:', decoded?.exp, 'now:', now, 'válido:', decoded?.exp > now);
            
            if (!decoded?.exp || decoded.exp > now) {
              console.log('[authGuard] Fallback: token válido, permitiendo acceso');
              return true;
            }
          } catch (e) {
            console.error('[authGuard] Error al decodificar token de fallback', e);
          }
        }
        console.warn('[authGuard] Acceso denegado - Usuario no autenticado');
        return router.parseUrl('/login');
      }
    })
  );
  
};
