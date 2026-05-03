import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
  },
  {
    path: 'edit',
    loadComponent: () => import('./components/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
  },
  {
    path: 'change-password',
    loadComponent: () => import('./components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
  },
];
