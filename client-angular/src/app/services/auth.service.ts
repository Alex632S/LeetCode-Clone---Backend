import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'interviewer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'interviewer' | 'admin';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http
      .get<{ user: User }>(`${this.apiUrl}/auth/me`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    // Опционально: вызвать API logout если нужно
    this.http
      .post(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      )
      .subscribe();
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getCurrentUser().subscribe({
        error: () => {
          localStorage.removeItem('token');
        },
      });
    }
  }

  getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isInterviewer(): boolean {
    return this.hasRole('interviewer');
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
