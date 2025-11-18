import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Usuario } from './autenticacion.service';

// Interfaz para la respuesta de la API que incluye el paciente y su usuario
export interface ApiPacienteResponse {
  id: number;
  usuario_id: number;
  telefono: string;
  fechaNacimiento: Date;
  Usuario: Usuario;
}

// Interfaz Paciente APLANADA para uso en los componentes
export interface Paciente {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
  fechaNacimiento: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pacientes`;

  registrarPaciente(pacienteData: any) {
    console.log('[PACIENTE SERVICE] Enviando POST a:', `${this.apiUrl}/registro`)
    console.log('[PACIENTE SERVICE] Datos:', pacienteData)
    return this.http.post(`${this.apiUrl}/registro`, pacienteData);
  }

  getPacienteById(id: string) {
    return this.http.get<ApiPacienteResponse>(`${this.apiUrl}/${id}`).pipe(
      map(p => this.normalizePaciente(p))
    );
  }

  getPacienteByDni(dni: string) {
    return this.http.get<ApiPacienteResponse>(`${this.apiUrl}/dni/${dni}`).pipe(
      map(p => this.normalizePaciente(p))
    );
  }

  getAllPacientes(token: string) {
    return this.http.get<ApiPacienteResponse[]>(`${this.apiUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      map(arr => arr.map(p => this.normalizePaciente(p)))
    );
  }

  updatePaciente(idPaciente: string, email: string, telefono: string) {
    const body = { email, telefono };
    return this.http.put(`${this.apiUrl}/${idPaciente}`, body);
  }

  desvincularGoogle(idPaciente: string) {
    return this.http.put(`${this.apiUrl}/desvincular/${idPaciente}`, {});
  }

  private normalizePaciente(p: ApiPacienteResponse): Paciente {
    return {
      id: String(p.id),
      usuario_id: String(p.Usuario.id),
      nombre: p.Usuario.nombre,
      apellido: p.Usuario.apellido,
      email: p.Usuario.email,
      dni: p.Usuario.dni,
      telefono: p.telefono,
      fechaNacimiento: p.fechaNacimiento,
    };
  }
}
