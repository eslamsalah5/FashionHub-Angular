import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Pure static shell pages — no API calls needed at build time
  { path: 'auth/login',              renderMode: RenderMode.Prerender },
  { path: 'auth/register',           renderMode: RenderMode.Prerender },
  { path: 'auth/forgot-password',    renderMode: RenderMode.Prerender },
  { path: 'auth/reset-password',     renderMode: RenderMode.Prerender },
  { path: 'access-denied',           renderMode: RenderMode.Prerender },

  // All other routes rendered on the server per request
  // (product pages, cart, orders, etc. all need live API data)
  { path: '**',                      renderMode: RenderMode.Server },
];
