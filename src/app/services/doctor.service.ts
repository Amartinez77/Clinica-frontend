import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Usuario } from './autenticacion.service';

// Interfaz para la respuesta de la API que incluye el doctor y su usuario
export interface ApiDoctorResponse {
  id: number;
  usuario_id: number;
  especialidadId: number;
  matricula: string;
  precioConsulta: number;
  telefono: string;
  estado: 'activo' | 'inactivo';
  disponibilidad: any;
  Usuario: Usuario;
  Especialidad: { id: number; nombre: string };
}

export interface Especialidad {
  id: string;
  nombre: string;
}

// Interfaz Doctor APLANADA para uso en los componentes
export interface Doctor {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: Especialidad;
  telefono: string;
  matricula: string;
  precioConsulta: number;
  estado: 'activo' | 'inactivo';
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/doctores`;

  registrarDoctor(doctorData: any, token: string) {
    return this.http.post(this.apiUrl, doctorData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getDoctores() {
    return this.http.get<ApiDoctorResponse[]>(this.apiUrl).pipe(
      map((arr) => arr.map(d => this.normalizeDoctor(d)))
    );
  }

  getDoctoresByName(nombre: string) {
    return this.http.get<ApiDoctorResponse[]>(`${this.apiUrl}/name?nombre=${nombre}`).pipe(
      map(arr => arr.map(d => this.normalizeDoctor(d)))
    );
  }

  getDoctoresByEspecialidad(idEspecialidad: string) {
    return this.http.get<ApiDoctorResponse[]>(`${this.apiUrl}/especialidad/${idEspecialidad}`).pipe(
      map(arr => arr.map(d => this.normalizeDoctor(d)))
    );
  }

  desactivarDoctor(id: string, token: string) {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado: 'inactivo' }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getDoctorById(id: string) {
    return this.http.get<ApiDoctorResponse>(`${this.apiUrl}/${id}`).pipe(
      map(d => this.normalizeDoctor(d))
    );
  }

  actualizarDoctor(id: string, doctor: any, token: string) {
    return this.http.put(`${this.apiUrl}/${id}`, doctor, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  private normalizeDoctor(d: ApiDoctorResponse): Doctor {
    return {
      id: String(d.id),
      usuario_id: String(d.Usuario.id),
      nombre: d.Usuario.nombre,
      apellido: d.Usuario.apellido,
      email: d.Usuario.email,
      especialidad: {
        id: String(d.Especialidad.id),
        nombre: d.Especialidad.nombre,
      },
      telefono: d.telefono,
      matricula: d.matricula,
      precioConsulta: d.precioConsulta,
      estado: d.estado,
    };
  }
}
