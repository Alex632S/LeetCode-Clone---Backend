import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { routes } from './app.routes';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MaterialModule } from './material/material.module';

// Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './pages/public/home/home.component';
import { ProblemListComponent } from './pages/admin/problems/problem-list/problem-list.component';
import { ProblemDetailComponent } from './pages/admin/problems/problem-detail/problem-detail.component';
import { ProblemFormComponent } from './pages/admin/problems/problem-form/problem-form.component';
import { UserListComponent } from './pages/admin/users/user-list/user-list.component';
import { UserEditComponent } from './pages/admin/users/user-edit/user-edit.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProblemListComponent,
    ProblemDetailComponent,
    ProblemFormComponent,
    UserListComponent,
    UserEditComponent,
    ConfirmDialogComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
