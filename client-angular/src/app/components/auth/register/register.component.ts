import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { AuthService, RegisterRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  roles = [
    { value: 'user', label: 'Пользователь' },
    { value: 'interviewer', label: 'Интервьюер' },
    { value: 'admin', label: 'Администратор' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: ['user', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Если пользователь уже авторизован, перенаправляем в админку
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/problems']);
    }
  }

  // Кастомный валидатор для проверки совпадения паролей
  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;

      const userData: RegisterRequest = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: this.registerForm.value.role,
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(
            response.message || 'Регистрация успешна!',
            'Закрыть',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
          this.router.navigate(['/admin/problems']);
        },
        error: (error: any) => {
          this.isLoading = false;
          const errorMessage =
            error.error?.error || 'Ошибка регистрации. Попробуйте еще раз.';
          this.snackBar.open(errorMessage, 'Закрыть', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  getUsernameErrorMessage(): string {
    const usernameControl = this.registerForm.get('username');
    if (usernameControl?.hasError('required')) {
      return 'Имя пользователя обязательно';
    }
    if (usernameControl?.hasError('minlength')) {
      return 'Минимум 3 символа';
    }
    if (usernameControl?.hasError('maxlength')) {
      return 'Максимум 30 символов';
    }
    return '';
  }

  getEmailErrorMessage(): string {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email обязателен';
    }
    if (emailControl?.hasError('email')) {
      return 'Введите корректный email';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Пароль обязателен';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'Подтверждение пароля обязательно';
    }
    if (
      this.registerForm.hasError('passwordMismatch') &&
      confirmPasswordControl?.touched
    ) {
      return 'Пароли не совпадают';
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getRoleLabel(roleValue: string): string {
    const role = this.roles.find((r) => r.value === roleValue);
    return role ? role.label : roleValue;
  }
}
