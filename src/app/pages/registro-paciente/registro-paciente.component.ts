import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.css',
})
export class RegistroPacienteComponent {
  paciente = {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    fechaNacimiento: '',
    email: '',
    password: '',
    tipo: 'paciente', // Campo añadido para el registro unificado
  };

  mensaje = '';
  error = '';
  cargando = false;

  constructor(
    private pacienteService: PacienteService,
    private router: Router,
    private toastService: ToastService
  ) {}

  registrarPaciente(): void {
    console.log('[REGISTRO PACIENTE - FRONTEND] Iniciando registro...')
    console.log('[REGISTRO PACIENTE - FRONTEND] Datos del formulario:', this.paciente)
    this.mensaje = '';
    this.error = '';
    this.cargando = true;
    // El backend ahora espera un solo objeto con todos los datos
    console.log('[REGISTRO PACIENTE - FRONTEND] Enviando datos al servicio...')
    this.pacienteService.registrarPaciente(this.paciente).subscribe({
      next: (res) => {
        console.log('[REGISTRO PACIENTE - FRONTEND] Respuesta exitosa:', res)
        this.mensaje = 'Paciente registrado exitosamente';
        this.paciente = {
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          fechaNacimiento: '',
          email: '',
          password: '',
          tipo: 'paciente',
        };
        this.cargando = false;
        this.toastService.showSuccess(this.mensaje, 'Registro Exitoso');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log('[REGISTRO PACIENTE - FRONTEND] Error en registro:', err)
        console.log('[REGISTRO PACIENTE - FRONTEND] Respuesta de error:', err.error)
        this.error = err.error?.msg || err.error?.message || err.error?.error || 'Error al registrar paciente.';
        this.cargando = false;
        this.toastService.showError(this.error);
      },
    });
  }
}
