import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map, firstValueFrom, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

// --- INICIO DE INTERFACES ---

// Estructura de datos base del usuario, devuelta por la API
export interface Usuario {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  tipo: 'paciente' | 'doctor' | 'admin';
}

// Perfil específico de Paciente
export interface PacienteProfile {
  id: number;
  usuario_id: number;
  telefono: string;
  fechaNacimiento: Date;
}

// Perfil específico de Doctor
export interface DoctorProfile {
  id: number;
  usuario_id: number;
  telefono: string;
  matricula: string;
}

// Respuesta completa de la API para un perfil de usuario
export interface ApiUserProfile extends Usuario {
  Paciente?: PacienteProfile;
  Doctor?: DoctorProfile;
}

// Petición de login
export interface LoginRequest {
  dni: string;
  password: string;
  tipo: 'paciente' | 'doctor' | 'admin';
}

// Respuesta del login
export interface LoginResponse {
  token: string;
  user: ApiUserProfile;
}

// Payload del token decodificado
interface DecodeJwtPayload {
  usuario: {
    id: string;
    tipo: 'paciente' | 'doctor' | 'admin';
  };
  exp: number;
  iat: number;
}

// Perfil de usuario APLANADO para uso interno en el frontend
export interface UserProfile {
  id: string;
  usuario_id: string;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  tipo: 'paciente' | 'doctor' | 'admin';
  telefono?: string;
  fechaNacimiento?: Date;
  matricula?: string;
}

// --- FIN DE INTERFACES ---

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  private _currentUserProfile = new BehaviorSubject<UserProfile | null>(null);
  public currentUserProfile$ = this._currentUserProfile.asObservable();

  private _initializationPromise: Promise<void> | null = null;
  private _isInitialized = false;

  public get currentUserValue(): UserProfile | null {
    return this._currentUserProfile.getValue();
  }

  constructor() {
    console.log('[AutenticacionService] Constructor START');
    console.log('[AutenticacionService] Token en localStorage:', this.getToken() ? 'SÍ' : 'NO');
    console.log('[AutenticacionService] Token válido:', this.checkTokenValidity() ? 'SÍ' : 'NO');
    
    this._initializationPromise = this.initializeAuth();
    console.log('[AutenticacionService] Constructor END');
  }

  private async initializeAuth(): Promise<void> {
    console.log('[initializeAuth] START');
    
    try {
      const token = this.getToken();
      console.log('[initializeAuth] Token:', token ? token.substring(0, 20) + '...' : 'null');
      
      const isValid = this.checkTokenValidity();
      console.log('[initializeAuth] Token válido:', isValid);
      
      if (!isValid) {
        console.log('[initializeAuth] No hay token válido, completando');
        this._isInitialized = true;
        return;
      }
      
      console.log('[initializeAuth] Llamando al endpoint /api/auth/perfil');
      const profile = await firstValueFrom(
        this.http.get<ApiUserProfile>(`${this.apiUrl}/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      console.log('[initializeAuth] Respuesta del servidor:', profile);
      
      const normalizedProfile = this._normalizeUserProfile(profile);
      console.log('[initializeAuth] Perfil normalizado:', normalizedProfile);
      
      this._currentUserProfile.next(normalizedProfile);
      this._isLoggedIn.next(true);
      
      console.log('[initializeAuth] SUCCESS - Usuario autenticado');
    } catch (error: any) {
      console.error('[initializeAuth] ERROR:', error?.status, error?.statusText, error?.message);
      console.error('[initializeAuth] Error completo:', error);
      this.logout();
    } finally {
      this._isInitialized = true;
      console.log('[initializeAuth] END');
    }
  }

  // Retorna una promesa que se resuelve cuando la autenticación está lista
  public getInitialization(): Promise<void> {
    console.log('[getInitialization] llamado, _isInitialized:', this._isInitialized);
    return this._initializationPromise || Promise.resolve();
  }

  resetPassword(dni: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { dni, newPassword });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          const normalizedProfile = this._normalizeUserProfile(response.user);
          this._currentUserProfile.next(normalizedProfile);
          this._isLoggedIn.next(true);
        }),
        catchError((error) => {
          console.error('Error de inicio de sesión:', error);
          this._isLoggedIn.next(false);
          return throwError(() => error);
        })
      );
  }

  getPerfilUsuario(): Observable<UserProfile | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }
    const token = this.getToken();
    return this.http.get<ApiUserProfile>(`${this.apiUrl}/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      map(apiProfile => this._normalizeUserProfile(apiProfile)),
      tap(normalizedProfile => this._currentUserProfile.next(normalizedProfile)),
      catchError(error => {
        console.error('Error al cargar el perfil del usuario:', error);
        this.logout();
        return of(null);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this._isLoggedIn.next(true);
    // No necesitamos cargar el perfil aquí, será cargado por el tap en login()
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.next(false);
    this._currentUserProfile.next(null);
    this._initializationPromise = null; // Resetear para permitir reinicialización
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn.getValue();
  }

  private checkTokenValidity(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: DecodeJwtPayload = jwtDecode(token);
      return Date.now() < decoded.exp * 1000;
    } catch (error) {
      return false;
    }
  }

  getUserRole(): 'paciente' | 'doctor' | 'admin' | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: DecodeJwtPayload = jwtDecode(token);
      return decoded.usuario.tipo;
    } catch (error) {
      return null;
    }
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: DecodeJwtPayload = jwtDecode(token);
      return decoded.usuario.id;
    } catch (error) {
      return null;
    }
  }

  private _normalizeUserProfile(apiProfile: ApiUserProfile): UserProfile {
    const baseProfile = {
      usuario_id: String(apiProfile.id),
      dni: apiProfile.dni,
      nombre: apiProfile.nombre,
      apellido: apiProfile.apellido,
      email: apiProfile.email,
      tipo: apiProfile.tipo,
    };

    if (apiProfile.tipo === 'paciente' && apiProfile.Paciente) {
      return {
        ...baseProfile,
        id: String(apiProfile.Paciente.id),
        telefono: apiProfile.Paciente.telefono,
        fechaNacimiento: apiProfile.Paciente.fechaNacimiento,
      };
    }

    if (apiProfile.tipo === 'doctor' && apiProfile.Doctor) {
      return {
        ...baseProfile,
        id: String(apiProfile.Doctor.id),
        telefono: apiProfile.Doctor.telefono,
        matricula: apiProfile.Doctor.matricula,
      };
    }

    return { ...baseProfile, id: String(apiProfile.id) };
  }
}
