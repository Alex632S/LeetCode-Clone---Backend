import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersService } from '../../../../services/users.service';
import { User } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  userId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  user: User | null = null;

  roles = [
    { value: 'user', label: 'Пользователь' },
    { value: 'interviewer', label: 'Интервьюер' },
    { value: 'admin', label: 'Администратор' },
  ];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.userId) {
      this.loadUser();
    }
  }

  loadUser(): void {
    this.isLoading = true;
    this.usersService.getUser(this.userId!).subscribe({
      next: (user: User) => {
        this.user = user;
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role,
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Ошибка загрузки пользователя', 'Закрыть', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.isLoading = false;
        console.error('Error loading user:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.valid && this.userId) {
      this.isSubmitting = true;

      this.usersService.updateUser(this.userId, this.userForm.value).subscribe({
        next: (updatedUser: User) => {
          // ✅ Типизируем параметр
          this.isSubmitting = false;
          this.snackBar.open('Пользователь успешно обновлен', 'Закрыть', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.router.navigate(['/admin/users']);
        },
        error: (error: any) => {
          this.isSubmitting = false;
          const errorMessage =
            error.error?.error || 'Ошибка обновления пользователя';
          this.snackBar.open(errorMessage, 'Закрыть', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          console.error('Error updating user:', error);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach((key) => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  getRoleLabel(roleValue: string): string {
    const role = this.roles.find((r) => r.value === roleValue);
    return role ? role.label : roleValue;
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
}
