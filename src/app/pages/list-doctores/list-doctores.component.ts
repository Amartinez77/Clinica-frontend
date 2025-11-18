import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../services/especialidad.service';
import { DoctorService, Doctor, Especialidad } from '../../services/doctor.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-doctores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-doctores.component.html',
  styleUrls: ['./list-doctores.component.css']
})
export class ListDoctoresComponent implements OnInit {
  @Input() pacienteId!: string;
  @Input() mostrarBotonTurno: boolean = false; // Controla la visibilidad del botón de solicitar turno
  busquedaNombre: string = '';
  filtroEspecialidad: string = '';

  especialidades: Especialidad[] = [];
  doctores: Doctor[] = [];
  filteredDoctores: Doctor[] = [];
  displayedDoctores: Doctor[] = []; // Doctores mostrados en pantalla
  
  @Input() showList: boolean = true;

  cargando: boolean = false;
  mensajeInfo: string = '';

  // Paginación
  itemsPerPage: number = 8;
  currentPage: number = 0;

  especialidadService = inject(EspecialidadService);
  doctorService = inject(DoctorService);
  router = inject(Router);

  ngOnInit(): void {
    this.loadInitialData();
  }

  onBuscarNombre() {
    this.filterDoctores();
  }

  onFiltrarEspecialidad() {
    this.filterDoctores();
  }

  onClickReservarTurno(doctorId: string) {
    this.router.navigate(['/reserva-turno', doctorId]);
  }

  loadInitialData() {
    this.cargando = true;
    this.mensajeInfo = '';
    this.especialidadService.getEspecialidades().subscribe({
      next: (especialidades: any) => {
        this.especialidades = especialidades;
      },
      error: (err) => {
        console.error('Error al cargar especialidades', err);
      }
    });

    this.doctorService.getDoctores().subscribe({
      next: (doctores) => {
        this.doctores = doctores;
        this.filteredDoctores = doctores;
        this.updateDisplayedDoctores(); // Mostrar primeros 8 doctores
        if (this.doctores.length === 0) {
          this.mensajeInfo = 'No hay doctores disponibles en este momento.';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar doctores', err);
        this.mensajeInfo = 'No se pudieron cargar los doctores. Intente de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  filterDoctores() {
    let tempDoctores = this.doctores;

    if (this.busquedaNombre) {
      tempDoctores = tempDoctores.filter(doctor =>
        doctor.nombre.toLowerCase().includes(this.busquedaNombre.toLowerCase()) ||
        doctor.apellido.toLowerCase().includes(this.busquedaNombre.toLowerCase())
      );
    }

    if (this.filtroEspecialidad) {
      tempDoctores = tempDoctores.filter(doctor => doctor.especialidad.id === this.filtroEspecialidad);
    }

    this.filteredDoctores = tempDoctores;
    this.currentPage = 0; // Resetear a la primera página al filtrar
    this.updateDisplayedDoctores();

    if (this.filteredDoctores.length === 0) {
      this.mensajeInfo = 'No se encontraron doctores que coincidan con los criterios de búsqueda.';
    } else {
      this.mensajeInfo = '';
    }
  }

  updateDisplayedDoctores() {
    const endIndex = (this.currentPage + 1) * this.itemsPerPage;
    this.displayedDoctores = this.filteredDoctores.slice(0, endIndex);
  }

  verMasDoctores() {
    this.currentPage++;
    this.updateDisplayedDoctores();
  }

  obtenerTotalDoctores(): number {
    return this.filteredDoctores.length;
  }

  tieneMasDoctores(): boolean {
    return this.displayedDoctores.length < this.filteredDoctores.length;
  }

  reservarTurno(doctor: Doctor) {
    this.router.navigate(['/reserva-turno', doctor.id]);
  }
}
