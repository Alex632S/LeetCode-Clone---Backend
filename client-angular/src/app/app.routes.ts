import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

// Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './pages/public/home/home.component';
import { ProblemListComponent } from './pages/admin/problems/problem-list/problem-list.component';
import { ProblemDetailComponent } from './pages/admin/problems/problem-detail/problem-detail.component';
import { ProblemFormComponent } from './pages/admin/problems/problem-form/problem-form.component';
import { UserListComponent } from './pages/admin/users/user-list/user-list.component';
import { UserEditComponent } from './pages/admin/users/user-edit/user-edit.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin routes (protected)
  {
    path: 'admin/problems',
    component: ProblemListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/problems/new',
    component: ProblemFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/problems/:id',
    component: ProblemDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/problems/:id/edit',
    component: ProblemFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/users',
    component: UserListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/users/:id/edit',
    component: UserEditComponent,
    canActivate: [authGuard],
  },

  // Redirect
  { path: '**', redirectTo: '' },
];
