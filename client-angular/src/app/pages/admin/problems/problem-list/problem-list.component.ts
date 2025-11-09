import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProblemsService } from '../../../../services/problems.service';
import { Problem } from '../../../../interfaces/problem.interface';
import { ConfirmDialogComponent } from '../../../../components/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-problem-list',
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
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.scss'],
})
export class ProblemListComponent implements OnInit {
  problems: Problem[] = [];
  isLoading = true;
  displayedColumns: string[] = ['id', 'title', 'difficulty', 'tags', 'actions'];

  constructor(
    private problemsService: ProblemsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.isLoading = true;
    this.problemsService.getProblems().subscribe({
      next: (response) => {
        this.problems = response.problems;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Ошибка загрузки задач', 'Закрыть', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.isLoading = false;
        console.error('Error loading problems:', error);
      },
    });
  }

  viewProblem(id: number): void {
    this.router.navigate(['/admin/problems', id]);
  }

  editProblem(id: number): void {
    this.router.navigate(['/admin/problems', id, 'edit']);
  }

  deleteProblem(problem: Problem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Удаление задачи',
        message: `Вы уверены, что хотите удалить задачу "${problem.title}"?`,
        confirmText: 'Удалить',
        cancelText: 'Отмена',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.problemsService.deleteProblem(problem.id).subscribe({
          next: () => {
            this.snackBar.open('Задача удалена', 'Закрыть', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.loadProblems();
          },
          error: (error) => {
            this.snackBar.open('Ошибка удаления задачи', 'Закрыть', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
            console.error('Error deleting problem:', error);
          },
        });
      }
    });
  }

  createProblem(): void {
    this.router.navigate(['/admin/problems/new']);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#757575';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'Легкая';
      case 'medium':
        return 'Средняя';
      case 'hard':
        return 'Сложная';
      default:
        return difficulty;
    }
  }
}
