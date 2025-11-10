import { Component, inject, signal, computed } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';

import { ProblemsService } from '../../../../services/problems.service';
import { Problem } from '../../../../interfaces/problem.interface';
import { ConfirmDialogComponent } from '../../../../components/shared/confirm-dialog/confirm-dialog.component';
import { DifficultyService } from '../../../../helpers/utils/difficulty.utils';

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
export class ProblemListComponent {
  // Services
  private problemsService = inject(ProblemsService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private difficultyService = inject(DifficultyService);

  // Signals
  private problemsResult = toSignal(this.problemsService.getProblems(), {
    initialValue: null,
  });

  isLoading = signal(true);
  displayedColumns = signal<string[]>([
    'id',
    'title',
    'difficulty',
    'tags',
    'actions',
  ]);

  // Computed values
  problems = computed(() => {
    const result = this.problemsResult();
    return result?.problems || [];
  });

  hasProblems = computed(() => this.problems().length > 0);

  problemsCount = computed(() => this.problems().length);

  // Constructor
  constructor() {
    this.loadProblems();
  }

  private async loadProblems(): Promise<void> {
    this.isLoading.set(true);

    try {
      // toSignal автоматически обработает подписку
      await this.problemsService.getProblems().toPromise();
    } catch (error) {
      this.showError('Ошибка загрузки задач');
      console.error('Error loading problems:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Navigation methods
  viewProblem(id: number): void {
    this.router.navigate(['/admin/problems', id]);
  }

  editProblem(id: number): void {
    this.router.navigate(['/admin/problems', id, 'edit']);
  }

  async deleteProblem(problem: Problem): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Удаление задачи',
        message: `Вы уверены, что хотите удалить задачу "${problem.title}"?`,
        confirmText: 'Удалить',
        cancelText: 'Отмена',
      },
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      try {
        await this.problemsService.deleteProblem(problem.id).toPromise();
        this.showSuccess('Задача удалена');
        this.loadProblems(); // Перезагружаем список
      } catch (error) {
        this.showError('Ошибка удаления задачи');
        console.error('Error deleting problem:', error);
      }
    }
  }

  createProblem(): void {
    this.router.navigate(['/admin/problems/new']);
  }

  // Helper methods
  getDifficultyColor(difficulty: string): string {
    return this.difficultyService.getDifficultyColor(difficulty);
  }

  getDifficultyText(difficulty: string): string {
    return this.difficultyService.getDifficultyText(difficulty);
  }

  // Snackbar helpers
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }

  // Refresh method
  refreshProblems(): void {
    this.loadProblems();
  }
}
