import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

import { ProblemsService } from '../../../../services/problems.service';
import { TagsService } from '../../../../services/tags.service';
import {
  Problem,
  ProblemCreate,
  ProblemExample,
} from '../../../../interfaces/problem.interface';
import { Tag } from '../../../../interfaces/tag.interface';

@Component({
  selector: 'app-problem-form',
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
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatDividerModule,
  ],
  templateUrl: './problem-form.component.html',
  styleUrls: ['./problem-form.component.scss'],
})
export class ProblemFormComponent implements OnInit {
  problemForm: FormGroup;
  isEditMode = false;
  problemId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  allTags: Tag[] = [];
  filteredTags: Tag[] = [];

  difficulties = [
    { value: 'easy', label: 'Легкая' },
    { value: 'medium', label: 'Средняя' },
    { value: 'hard', label: 'Сложная' },
  ];

  constructor(
    private fb: FormBuilder,
    private problemsService: ProblemsService,
    private tagsService: TagsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.problemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['', Validators.required],
      examples: this.fb.array([]),
      tags: [[]],
    });
  }

  ngOnInit(): void {
    this.loadTags();

    this.problemId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = this.route.snapshot.url.some(
      (segment) => segment.path === 'edit'
    );

    if (this.isEditMode && this.problemId) {
      this.loadProblem();
    } else {
      this.addExample(); // Добавляем пустой пример по умолчанию
    }
  }

  loadProblem(): void {
    this.isLoading = true;
    this.problemsService.getProblem(this.problemId!).subscribe({
      next: (problem: Problem) => {
        this.problemForm.patchValue({
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
        });

        // Загружаем примеры
        this.examplesFormArray.clear();
        problem.examples.forEach((example: ProblemExample) => {
          // ✅ Типизируем параметр
          this.addExample(example);
        });

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

  loadTags(): void {
    this.tagsService.getTags().subscribe({
      next: (response) => {
        this.allTags = response.tags;
        this.filteredTags = response.tags;
      },
      error: (error: any) => {
        console.error('Error loading tags:', error);
      },
    });
  }

  get examplesFormArray(): FormArray {
    return this.problemForm.get('examples') as FormArray;
  }

  addExample(example?: ProblemExample): void {
    // ✅ Типизируем параметр
    const exampleGroup = this.fb.group({
      input: [example?.input || '', Validators.required],
      output: [example?.output || '', Validators.required],
      explanation: [example?.explanation || ''],
    });
    this.examplesFormArray.push(exampleGroup);
  }

  removeExample(index: number): void {
    this.examplesFormArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.problemForm.valid) {
      this.isSubmitting = true;

      const problemData: ProblemCreate = {
        title: this.problemForm.value.title,
        description: this.problemForm.value.description,
        difficulty: this.problemForm.value.difficulty,
        examples: this.problemForm.value.examples,
        tags: this.problemForm.value.tags || [],
      };

      const request = this.isEditMode
        ? this.problemsService.updateProblem(this.problemId!, problemData)
        : this.problemsService.createProblem(problemData);

      request.subscribe({
        next: (problem: Problem) => {
          this.isSubmitting = false;
          const message = this.isEditMode
            ? 'Задача обновлена'
            : 'Задача создана';
          this.snackBar.open(message, 'Закрыть', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.router.navigate(['/admin/problems']);
        },
        error: (error: any) => {
          this.isSubmitting = false;
          const errorMessage = error.error?.error || 'Ошибка сохранения задачи';
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
    Object.keys(this.problemForm.controls).forEach((key) => {
      const control = this.problemForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach((group: AbstractControl) => {
          if (group instanceof FormGroup) {
            Object.keys(group.controls).forEach((subKey) => {
              group.get(subKey)?.markAsTouched();
            });
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/problems']);
  }

  getDifficultyLabel(difficulty: string): string {
    const diff = this.difficulties.find((d) => d.value === difficulty);
    return diff ? diff.label : difficulty;
  }
}
