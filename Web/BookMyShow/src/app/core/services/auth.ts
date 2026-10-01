import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { CreateUserRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly tokenKey = 'bms_token';
  private readonly userKey = 'bms_user';

  currentUser = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  register(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }
}