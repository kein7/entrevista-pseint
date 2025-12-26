import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://localhost:XXXX/api/auth'; // Cambia el puerto

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
        }
      })
    );
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
