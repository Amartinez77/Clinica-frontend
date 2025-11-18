import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { EspecialidadesService, Especialidad } from '../../services/especialidades.service';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

// Interfaz para agrupar doctores por especialidad
interface EspecialidadConDoctores {
  _id: string;
  nombre: string;
  descripcion?: string; // Opcional, para futuras implementaciones
  doctores: Doctor[];
  expandida: boolean; // Control de expansión
  mostrandoDoctores: Doctor[]; // Doctores mostrados en pantalla
  paginaActual: number; // Página actual
  itemsPorPagina: number; // Items por página
}

@Component({
  selector: 'app-especialidades',
  imports: [CommonModule, RouterLink],
  templateUrl: './especialidades.component.html',
  styleUrl: './especialidades.component.css'
})
export class EspecialidadesComponent implements OnInit {
  
  especialidades: EspecialidadConDoctores[] = [];
  cargando = false;
  error = '';

  constructor(
    private doctorService: DoctorService,
    private especialidadesService: EspecialidadesService
  ) {}

  ngOnInit(): void {
    this.cargarEspecialidadesConDoctores();
  }

  cargarEspecialidadesConDoctores(): void {
    this.cargando = true;
    this.error = '';
    
    // Obtener tanto doctores como especialidades en paralelo
    forkJoin({
      doctores: this.doctorService.getDoctores(),
      especialidades: this.especialidadesService.getEspecialidades()
    }).subscribe({
      next: ({ doctores, especialidades }) => {
        this.especialidades = this.agruparPorEspecialidad(doctores, especialidades);
        this.cargando = false;
        console.log('Especialidades con doctores:', this.especialidades);
      },
      error: (err) => {
        this.error = 'Error al cargar las especialidades y doctores';
        this.cargando = false;
        console.error('Error al cargar especialidades:', err);
      }
    });
  }

  // Método para agrupar doctores por especialidad
  private agruparPorEspecialidad(doctores: Doctor[], especialidades: Especialidad[]): EspecialidadConDoctores[] {
    const especialidadesMap = new Map<string, EspecialidadConDoctores>();

    // Crear un mapa de especialidades para acceso rápido a las descripciones
    const especialidadesInfo = new Map<string, Especialidad>();
    especialidades.forEach(esp => {
      // aceptar tanto _id (Mongo) como id (Sequelize)
      const espId = (esp as any)._id || (esp as any).id || ''
      if (espId) especialidadesInfo.set(String(espId), esp);
    });

    doctores.forEach(doctor => {
      // especialidad puede venir como objeto con _id o id, o puede venir null
      const espObj: any = doctor.especialidad || {};
  const especialidadId = espObj._id || espObj.id || (doctor as any).especialidadId || '';
      const especialidadNombre = espObj.nombre || '';
      const especialidadInfo = especialidadesInfo.get(especialidadId);

      if (!especialidadesMap.has(especialidadId)) {
        especialidadesMap.set(especialidadId, {
          _id: especialidadId,
          nombre: especialidadNombre,
          descripcion: especialidadInfo?.descripcion || 'Especialidad médica profesional',
          doctores: [],
          expandida: false,
          mostrandoDoctores: [],
          paginaActual: 0,
          itemsPorPagina: 8
        });
      }

      especialidadesMap.get(especialidadId)!.doctores.push(doctor);
    });

    return Array.from(especialidadesMap.values()).sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    );
  }

  // Método para refrescar la lista
  refrescarEspecialidades(): void {
    this.cargarEspecialidadesConDoctores();
  }

  // Método para obtener el nombre completo del doctor
  getNombreCompleto(doctor: Doctor): string {
    return `Dr. ${doctor.nombre} ${doctor.apellido}`;
  }

  // Método para expandir/contraer una especialidad
  toggleEspecialidad(especialidad: EspecialidadConDoctores): void {
    especialidad.expandida = !especialidad.expandida;
    if (especialidad.expandida) {
      this.actualizarDoctoresVisibles(especialidad);
    }
  }

  // Método para actualizar los doctores visibles en la paginación
  actualizarDoctoresVisibles(especialidad: EspecialidadConDoctores): void {
    const inicio = especialidad.paginaActual * especialidad.itemsPorPagina;
    const fin = inicio + especialidad.itemsPorPagina;
    especialidad.mostrandoDoctores = especialidad.doctores.slice(inicio, fin);
  }

  // Método para cargar más doctores en una especialidad
  verMasDoctores(especialidad: EspecialidadConDoctores): void {
    especialidad.paginaActual++;
    this.actualizarDoctoresVisibles(especialidad);
  }

  // Método para verificar si hay más doctores por cargar
  tieneMasDoctores(especialidad: EspecialidadConDoctores): boolean {
    const totalMostrados = (especialidad.paginaActual + 1) * especialidad.itemsPorPagina;
    return totalMostrados < especialidad.doctores.length;
  }

  // Método para obtener el total de doctores mostrados
  totalMostrados(especialidad: EspecialidadConDoctores): number {
    return Math.min((especialidad.paginaActual + 1) * especialidad.itemsPorPagina, especialidad.doctores.length);
  }
}
