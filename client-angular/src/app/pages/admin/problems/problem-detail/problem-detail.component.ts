import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProblemsService } from '../../../../services/problems.service';
import { Problem } from '../../../../interfaces/problem.interface';
import { FormattingService } from '../../../../helpers/utils/formatting.utils';
import { DifficultyService } from '../../../../helpers/utils/difficulty.utils';

@Component({
  selector: 'app-problem-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
  ],
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.scss'],
})
export class ProblemDetailComponent {
  // Services
  private problemsService = inject(ProblemsService);
  private formattingService = inject(FormattingService);
  private difficultyService = inject(DifficultyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Signals
  private problemId = computed(() =>
    Number(this.route.snapshot.paramMap.get('id'))
  );

  private problemResult = toSignal(
    this.problemsService.getProblem(this.problemId()),
    { initialValue: null }
  );

  problem = computed(() => this.problemResult());
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed values
  hasTags = computed(() => {
    const problem = this.problem();
    return problem?.tags && problem.tags.length > 0;
  });

  hasExamples = computed(() => {
    const problem = this.problem();
    return problem?.examples && problem.examples.length > 0;
  });

  difficultyColor = computed(() => {
    const problem = this.problem();
    return problem
      ? this.difficultyService.getDifficultyColor(problem.difficulty)
      : '#757575';
  });

  difficultyText = computed(() => {
    const problem = this.problem();
    return problem
      ? this.difficultyService.getDifficultyText(problem.difficulty)
      : '';
  });

  formattedCreatedAt = computed(() => {
    const problem = this.problem();
    return problem ? this.formattingService.formatDate(problem.createdAt) : '';
  });

  formattedUpdatedAt = computed(() => {
    const problem = this.problem();
    return problem ? this.formattingService.formatDate(problem.updatedAt) : '';
  });

  formattedDescription = computed(() => {
    const problem = this.problem();
    return problem
      ? this.formattingService.formatProblemDescription(problem.description)
      : '';
  });

  // Lifecycle
  constructor() {
    this.loadProblem();
  }

  private async loadProblem(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // toSignal автоматически обработает подписку
      await this.problemsService.getProblem(this.problemId()).toPromise();
    } catch (err) {
      this.error.set('Ошибка загрузки задачи');
      this.snackBar.open('Ошибка загрузки задачи', 'Закрыть', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  // Methods
  editProblem(): void {
    const problem = this.problem();
    if (problem) {
      this.router.navigate(['/admin/problems', problem.id, 'edit']);
    }
  }

  reloadProblem(): void {
    this.loadProblem();
  }
}
