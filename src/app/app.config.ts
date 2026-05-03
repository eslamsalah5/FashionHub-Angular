import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { baseUrlInterceptor } from './core/interceptors/base-url.interceptor';
import { API_BASE_URL } from './core/tokens/api-base-url.token';
import { STRIPE_PUBLISHABLE_KEY } from './core/tokens/stripe.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      // Order matters: baseUrl runs first so auth interceptor sees the full URL
      withInterceptors([baseUrlInterceptor, authInterceptor, errorInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    {
      provide: API_BASE_URL,
      // User is testing against the production deployment
      useValue: 'https://fashionhub.runasp.net',
    },
    {
      // Stripe Publishable Key
      // MUST match the Secret Key used in the backend!
      provide: STRIPE_PUBLISHABLE_KEY,
      useValue: 'pk_test_51PoyQxDfmNuhtiwAYPxPz8jfnnK62wXX7XVaRLFV7iOiXz3cd9jCcZGU8RtOkV06lE1hwImoXWjB3wQjU18k96ce00ATbgmVOM', // ← ضع الـ Publishable Key الخاص بك هنا (pk_test_...)
    },
  ],
};
