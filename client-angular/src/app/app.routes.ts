import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () =>
      import('./pages/public/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  // Admin routes (protected)
  {
    path: 'admin/problems',
    loadComponent: () =>
      import('./pages/admin/problems/problem-list/problem-list.component').then(
        (m) => m.ProblemListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/problems/new',
    loadComponent: () =>
      import('./pages/admin/problems/problem-form/problem-form.component').then(
        (m) => m.ProblemFormComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/problems/:id',
    loadComponent: () =>
      import(
        './pages/admin/problems/problem-detail/problem-detail.component'
      ).then((m) => m.ProblemDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin/problems/:id/edit',
    loadComponent: () =>
      import('./pages/admin/problems/problem-form/problem-form.component').then(
        (m) => m.ProblemFormComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users/user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/users/:id/edit',
    loadComponent: () =>
      import('./pages/admin/users/user-edit/user-edit.component').then(
        (m) => m.UserEditComponent
      ),
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: '' },
];
