import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Especialidad{
  _id: string;
  nombre: string;
  descripcion: string;
}
@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  http=inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/especialidades`;

  getEspecialidades() {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(arr => arr.map(e => ({
        _id: String(e._id ?? e.id),
        nombre: e.nombre,
        descripcion: e.descripcion ?? ''
      }) as Especialidad))
    );
  }
  getEspecialidadById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(e => ({
        _id: String(e._id ?? e.id),
        nombre: e.nombre,
        descripcion: e.descripcion ?? ''
      }) as Especialidad)
    );
  }

}

