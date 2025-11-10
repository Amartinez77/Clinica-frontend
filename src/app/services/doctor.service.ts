import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
export interface Especialidad {
  _id: string;
  nombre: string;
}
export interface Doctor {
  _id: string;
  nombre: string;
  apellido: string;
  especialidad: Especialidad;
  telefono: string;
  email: string;
  precioConsulta: number;
  activo: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/doctores`;

  registrarDoctor(doctor: any, token: string) {
    return this.http.post(this.apiUrl, doctor, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getDoctores() {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((arr) => arr.map(d => this.normalizeDoctor(d)))
    );
  }

  getDoctoresByName(nombre: string) {
    return this.http.get<any[]>(`${this.apiUrl}/name?nombre=${nombre}`).pipe(
      map(arr => arr.map(d => this.normalizeDoctor(d)))
    );
  }
  getDoctoresByEspecialidad(idEspecialidad: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/especialidad/${idEspecialidad}`
    ).pipe(
      map(arr => arr.map(d => this.normalizeDoctor(d)))
    );
  }
  desactivarDoctor(id: string, token: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  getDoctorById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(d => this.normalizeDoctor(d))
    );
  }

  actualizarDoctor(id: string, doctor: any, token: string) {
    return this.http.put(`${this.apiUrl}/${id}`, doctor, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  // Normaliza la forma del doctor que viene del backend (Sequelize) a la interfaz esperada por el frontend
  private normalizeDoctor(d: any): Doctor {
    // especialidad puede venir como 'Especialidad' (Sequelize) o 'especialidad' o solo especialidadId
    const esp = d.Especialidad || d.especialidad || null;
    const especialidad = esp
      ? { _id: esp.id ? String(esp.id) : String(esp._id || esp.id), nombre: esp.nombre }
      : d.especialidadId
      ? { _id: String(d.especialidadId), nombre: '' }
      : { _id: '', nombre: '' };

    return {
      _id: d.id ? String(d.id) : d._id,
      nombre: d.nombre,
      apellido: d.apellido,
      especialidad,
      telefono: d.telefono,
      email: d.email,
      precioConsulta: d.precioConsulta,
      activo: d.activo,
    } as Doctor;
  }
}
