import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { Especialidad, EspecialidadService } from '../../services/especialidad.service';
import { AutenticacionService } from '../../services/autenticacion.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-registro-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-doctor.component.html',
  styleUrl: './registro-doctor.component.css',
})
export class RegistroDoctorComponent implements OnInit {
  doctor = {
    dni: '',
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    matricula: '',
    especialidadId: '',
    precioConsulta: 0,
    tipo: 'doctor'
  };

  especialidades: Especialidad[] = [];
  cargando = false;
  mensaje = '';
  error = '';
  token: string | null = '';

  doctorService = inject(DoctorService);
  especialidadService = inject(EspecialidadService);
  autenticacionService = inject(AutenticacionService);
  router = inject(Router);
  toastService = inject(ToastService);

  constructor() {
    this.token = this.autenticacionService.getToken();
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.especialidadService.getEspecialidades().subscribe({
      next: (especialidades: Especialidad[]) => {
        this.especialidades = especialidades;
      },
      error: (err) => {
        this.error =
          'Error al cargar especialidades: ' +
          (err.error?.message || err.message || 'Error desconocido');
      },
    });
  }

  registrarDoctor(): void {
    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    if (!this.token) {
      this.error = 'No estás autenticado como administrador.';
      this.cargando = false;
      this.toastService.showError(this.error);
      return;
    }

    this.doctorService.registrarDoctor(this.doctor, this.token).subscribe({
      next: (response) => {
        this.mensaje =
          'Doctor registrado exitosamente. Redirigiendo al panel de admin...';
        this.cargando = false;
        
        this.limpiarFormulario();

        this.toastService.showSuccess(
          'Doctor registrado exitosamente',
          'Registro Exitoso'
        );
        
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error =
          err.error?.msg ||
          err.error?.message ||
          'Error al registrar doctor: ' + (err.message || 'Error desconocido');
        this.cargando = false;
        this.toastService.showError(this.error);
      },
    });
  }

  limpiarFormulario(): void {
    this.doctor = {
      dni: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: '',
      matricula: '',
      especialidadId: '',
      precioConsulta: 0,
      tipo: 'doctor'
    };
  }
}
