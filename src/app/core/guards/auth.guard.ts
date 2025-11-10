import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { take } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AutenticacionService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  return authService.isLoggedIn$.pipe(
    take(1), // Tomamos solo el primer valor emitido
    map(isLoggedIn => {
      if (isLoggedIn) {
        // Si está autenticado, permitimos el acceso
        return true;
      } else {
        // Fallback: si hay token en localStorage y no está expirado, permitir acceso
        const token = authService.getToken();
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const now = Date.now() / 1000;
            if (!decoded?.exp || decoded.exp > now) {
              // Opcional: re-hidratar estado
              // authService.setToken(token); // evitar side-effect si no se desea duplicar carga
              return true;
            }
          } catch (e) {
            console.error('authGuard: error al decodificar token de fallback', e);
          }
        }
        console.warn('Acceso denegado - Usuario no autenticado');
        return router.parseUrl('/login');
      }
    })
  );
  
};
