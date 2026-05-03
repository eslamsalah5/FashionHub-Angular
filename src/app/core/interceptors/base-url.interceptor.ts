import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-base-url.token';

/**
 * Prepends the API base URL to every request whose URL starts with `/api/`.
 * Requests to other origins (e.g. CDN image URLs) are left untouched.
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = inject(API_BASE_URL);

  if (req.url.startsWith('/api/')) {
    const fullUrl = `${baseUrl}${req.url}`;
    return next(req.clone({ url: fullUrl }));
  }

  return next(req);
};
