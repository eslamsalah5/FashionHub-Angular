import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },

  // ── Public ──────────────────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/routes').then(m => m.PRODUCTS_ROUTES),
  },

  // ── Customer-only ────────────────────────────────────────────────────
  // Cart: [Authorize] on all endpoints — Admin has no cart
  {
    path: 'cart',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadChildren: () => import('./features/cart/routes').then(m => m.CART_ROUTES),
  },
  // Orders: GET / and POST / are [Authorize(Roles="Customer")]
  {
    path: 'orders',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadChildren: () => import('./features/orders/routes').then(m => m.ORDERS_ROUTES),
  },
  // Checkout: POST create-payment-intent is [Authorize] but only makes sense for Customer
  {
    path: 'checkout',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadChildren: () => import('./features/checkout/routes').then(m => m.CHECKOUT_ROUTES),
  },

  // ── Admin-only ───────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadChildren: () => import('./features/admin/routes').then(m => m.ADMIN_ROUTES),
  },

  // ── Both roles (authenticated) ───────────────────────────────────────
  // Profile: my-profile and change-password work for both; update-customer/admin
  // is handled inside the component based on role
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profile/routes').then(m => m.PROFILE_ROUTES),
  },

  // ── Utility ─────────────────────────────────────────────────────────
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./features/auth/components/access-denied/access-denied.component').then(
        m => m.AccessDeniedComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
