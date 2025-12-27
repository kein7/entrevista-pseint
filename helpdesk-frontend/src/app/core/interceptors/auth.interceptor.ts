import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si la API responde 401 (No autorizado) o 403 (Prohibido)
      if (error.status === 401 || error.status === 403) {
        localStorage.clear(); // Limpiamos rastro del token viejo
        router.navigate(['/login']); // Lo expulsamos al login
      }
      return throwError(() => error);
    })
  );
};
