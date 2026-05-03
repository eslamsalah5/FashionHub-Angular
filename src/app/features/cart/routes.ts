import { Routes } from '@angular/router';

export const CART_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/cart-page/cart-page.component').then(m => m.CartPageComponent),
  },
];
