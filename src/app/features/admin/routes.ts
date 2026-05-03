import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./components/product-list/product-list.component').then(m => m.AdminProductListComponent),
  },
  {
    path: 'products/create',
    loadComponent: () => import('./components/product-form/product-form.component').then(m => m.ProductFormComponent),
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./components/product-form/product-form.component').then(m => m.ProductFormComponent),
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/order-management/order-management.component').then(m => m.OrderManagementComponent),
  },
];
