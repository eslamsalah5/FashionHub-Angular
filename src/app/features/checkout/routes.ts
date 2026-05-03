import { Routes } from '@angular/router';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent),
  },
];
