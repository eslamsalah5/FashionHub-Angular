import { InjectionToken } from '@angular/core';

/** Base URL for the FashionHub REST API. Override in tests or environments as needed. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://fashionhub.runasp.net'
});
