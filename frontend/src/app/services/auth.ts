import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, ProfileResponse, UpdateProfileRequest } from '../interfaces/auth.interface';

// Component'lerin eski import yolları bozulmasın diye re-export
export type { LoginResponse, ProfileResponse, UpdateProfileRequest } from '../interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'todo_token';
  private displayNameKey = 'todo_display_name';

  register(displayName: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { displayName, email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.displayNameKey, res.displayName);
      }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.displayNameKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getDisplayName(): string | null {
    return localStorage.getItem(this.displayNameKey);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/me`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }
}