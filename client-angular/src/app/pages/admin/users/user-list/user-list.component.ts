import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UsersService } from '../../../../services/users.service';
import { User, UsersResponse } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  displayedColumns: string[] = [
    'id',
    'username',
    'email',
    'role',
    'createdAt',
    'actions',
  ];

  constructor(
    private usersService: UsersService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.usersService.getUsers().subscribe({
      next: (response: UsersResponse) => {
        this.users = response.users;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Ошибка загрузки пользователей', 'Закрыть', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.isLoading = false;
        console.error('Error loading users:', error);
      },
    });
  }

  editUser(id: number): void {
    this.router.navigate(['/admin/users', id, 'edit']);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'interviewer':
        return '#ff9800';
      case 'user':
        return '#4caf50';
      default:
        return '#757575';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'interviewer':
        return 'Интервьюер';
      case 'user':
        return 'Пользователь';
      default:
        return role;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU');
  }
}
