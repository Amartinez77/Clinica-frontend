import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AutenticacionService,
  LoginRequest,
  UserProfile,
} from '../../services/autenticacion.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private autenticacionService = inject(AutenticacionService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  userTypes = [
    { label: 'Soy Paciente', value: 'paciente' as const },
    { label: 'Soy Doctor', value: 'doctor' as const },
    { label: 'Soy Admin', value: 'admin' as const },
  ];

  constructor() {
    this.loginForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{7,8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipo: ['paciente', Validators.required], // Valor por defecto 'paciente'
    });
  }

  selectUserType(type: 'paciente' | 'doctor' | 'admin') {
    this.loginForm.get('tipo')?.setValue(type);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const loginData: LoginRequest = this.loginForm.value;
    console.log('[LOGIN COMPONENT] Enviando datos de login:', loginData);

    this.autenticacionService.login(loginData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess('Inicio de sesión exitoso');
        
        const perfil = this.autenticacionService.currentUserValue;
        if (!perfil) {
          this.toastService.showError('No se pudo obtener el perfil del usuario.');
          return;
        }

        this.redirectUser(perfil);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.msg || 'DNI, contraseña o tipo de usuario incorrecto.';
        this.toastService.showError(errorMessage);
      },
    });
  }

  private redirectUser(perfil: UserProfile) {
    const role = perfil.tipo;
    if (role === 'paciente') {
      this.router.navigate(['/paciente/', perfil.id]);
    } else if (role === 'doctor') {
      this.router.navigate(['/doctor/', perfil.id]);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/']);
    } else {
      this.toastService.showError('Rol no reconocido.');
    }
  }
}
