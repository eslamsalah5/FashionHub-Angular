import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/order-list/order-list.component').then(m => m.OrderListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./components/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
  },
];
