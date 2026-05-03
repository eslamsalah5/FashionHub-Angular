import { InjectionToken } from '@angular/core';

/**
 * Stripe Publishable Key.
 * Override via environment or app.config.ts providers.
 * Never embed the SecretKey here — only the publishable key.
 */
export const STRIPE_PUBLISHABLE_KEY = new InjectionToken<string>('STRIPE_PUBLISHABLE_KEY');
