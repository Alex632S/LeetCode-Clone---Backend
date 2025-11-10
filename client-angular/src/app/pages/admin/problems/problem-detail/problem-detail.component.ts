import { Component, OnInit } from '@angular/core';
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

import { ProblemsService } from '../../../../services/problems.service';
import { Problem } from '../../../../interfaces/problem.interface';
import { FormattingService } from '../../../../helpers/formatting.service';
import { DifficultyService } from '../../../../helpers/difficulty.service';

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
export class ProblemDetailComponent implements OnInit {
  problem: Problem | null = null;
  isLoading = true;

  constructor(
    private problemsService: ProblemsService,
    private formattingService: FormattingService,
    private difficultyService: DifficultyService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const problemId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProblem(problemId);
  }

  loadProblem(id: number): void {
    this.isLoading = true;
    this.problemsService.getProblem(id).subscribe({
      next: (problem: Problem) => {
        this.problem = problem;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Ошибка загрузки задачи', 'Закрыть', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.isLoading = false;
      },
    });
  }

  editProblem(): void {
    if (this.problem) {
      this.router.navigate(['/admin/problems', this.problem.id, 'edit']);
    }
  }

  getDifficultyColor(difficulty: string): string {
    return this.difficultyService.getDifficultyColor(difficulty);
  }

  getDifficultyText(difficulty: string): string {
    return this.difficultyService.getDifficultyText(difficulty);
  }

  formatDate(dateString: string): string {
    return this.formattingService.formatDate(dateString);
  }

  formatDescription(description: string): string {
    return this.formattingService.formatProblemDescription(description);
  }
}
