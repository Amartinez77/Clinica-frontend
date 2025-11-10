import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../services/especialidad.service';
import { DoctorService } from '../../services/doctor.service';
import { Router } from '@angular/router';

export interface Especialidad{
  _id: string;
  nombre: string;
}
export interface Doctor {
  _id: string;
  nombre: string;
  apellido: string;
  especialidad: Especialidad;
  precioConsulta: number;
  telefono: string;
}
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

  especialidades: Especialidad[] = []

  doctores: Doctor[] = []
  cargando: boolean = false
  mensajeInfo: string = ''
  
  doctorService= inject(DoctorService);
  especialidadService= inject(EspecialidadService);
  private router = inject(Router);

  ngOnInit(): void {
    this.cargarDoctores();
    this.especialidadService.getEspecialidades().subscribe((especialidades: Especialidad[]) => {
      this.especialidades = especialidades;
    });
  }

  cargarDoctores(nombre: string = '', especialidad: string | null | undefined = '') {
    const name = (nombre ?? '').toString().trim();
    const espId = (especialidad ?? '').toString().trim();
    this.cargando = true;
    this.mensajeInfo = '';
    // Si ambos filtros están vacíos, trae todos
    if (name === '' && espId === '') {
      this.doctorService.getDoctores().subscribe((doctores: Doctor[] | null | undefined) => {
        this.doctores = Array.isArray(doctores) ? doctores : [];
        this.cargando = false;
        if (this.doctores.length === 0) {
          this.mensajeInfo = 'No hay doctores cargados en el sistema.';
        }
      });
    } else if (name !== '' && espId === '') {
      // Solo filtro por nombre
      this.doctorService.getDoctoresByName(name).subscribe((doctores: Doctor[]) => {
        this.doctores = doctores;
        this.cargando = false;
        if (this.doctores.length === 0) {
          this.mensajeInfo = `No hay doctores cuyo nombre coincida con "${name}".`;
        }
        console.log('Doctores filtrados por nombre:', this.doctores);
      });
    } else if (name === '' && espId !== '') {
      // Solo filtro por especialidad
      this.doctorService.getDoctoresByEspecialidad(espId).subscribe((doctores: Doctor[] | null | undefined) => {
        this.doctores = Array.isArray(doctores) ? doctores : [];
        this.cargando = false;
        if (this.doctores.length === 0) {
          this.mensajeInfo = 'No hay doctores de la especialidad seleccionada.';
        }
      });
    } else {
      // Filtro por ambos: primero por nombre, luego filtro por especialidad en el front
      this.doctorService.getDoctoresByName(name).subscribe((doctores: Doctor[] | null | undefined) => {
        const lista = Array.isArray(doctores) ? doctores : [];
        this.doctores = lista.filter(doc => doc.especialidad?._id === espId || doc.especialidad?.nombre === espId);
        this.cargando = false;
        if (this.doctores.length === 0) {
          this.mensajeInfo = 'No hay doctores que coincidan con los filtros seleccionados.';
        }
      });
    }
  }

  onClickReservarTurno(idDoctor:string){
    this.router.navigate(['/paciente', this.pacienteId, 'turno', idDoctor]);
  }
  onBuscarNombre() {
    this.cargarDoctores(this.busquedaNombre, this.filtroEspecialidad);
  }

  onFiltrarEspecialidad() {
    this.cargarDoctores(this.busquedaNombre, this.filtroEspecialidad);
  }

  doctoresFiltrados() {
    // Ya no es necesario filtrar aquí, porque se filtra en el backend o en cargarDoctores
    return this.doctores;
  }
}
