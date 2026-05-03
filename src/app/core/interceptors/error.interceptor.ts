import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        switch (true) {
          case error.status === 401:
            // Token expired or invalid — log the user out
            auth.logout();
            break;

          case error.status === 403:
            router.navigate(['/access-denied']);
            break;

          case error.status === 404:
            // Let components handle 404 locally (e.g. show empty state)
            break;

          case error.status === 409:
            // Conflict — usually a duplicate resource; let components handle it
            console.warn('[FashionHub] Conflict:', extractMessage(error));
            break;

          case error.status === 422:
            // Validation error — server-side validation failed
            console.warn('[FashionHub] Validation error:', extractMessage(error));
            break;

          case error.status >= 500:
            console.error('[FashionHub] Server error:', error);
            break;
        }
      }
      return throwError(() => error);
    })
  );
};

/** Extracts a human-readable message from an API error response */
function extractMessage(error: HttpErrorResponse): string {
  const body = error.error as Record<string, unknown> | null;
  if (!body) return error.message;
  // Our middleware returns { title, detail, ... }
  const detail = body['detail'] ?? body['Detail'] ?? body['message'] ?? body['Message'];
  return (typeof detail === 'string' ? detail : null) ?? error.message;
}
