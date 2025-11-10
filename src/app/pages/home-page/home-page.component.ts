import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  private authService = inject(AutenticacionService);

  // Observables para usar en el template
  isLoggedIn$ = this.authService.isLoggedIn$;
  currentUserProfile$ = this.authService.currentUserProfile$;

  /**
   * Hace scroll suave hacia la sección de ubicación
   */
  scrollToLocation(): void {
    const element = document.getElementById('location-section');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}
