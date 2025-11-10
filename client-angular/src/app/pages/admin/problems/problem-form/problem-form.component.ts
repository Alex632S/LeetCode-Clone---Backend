import { Component, inject, signal, computed } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';

import { ProblemsService } from '../../../../services/problems.service';
import { TagsService } from '../../../../services/tags.service';
import {
  Problem,
  ProblemCreate,
  ProblemExample,
} from '../../../../interfaces/problem.interface';
import { Tag } from '../../../../interfaces/tag.interface';
import { DifficultyService } from '../../../../helpers/utils/difficulty.utils';

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
export class ProblemFormComponent {
  // Services
  private fb = inject(FormBuilder);
  private problemsService = inject(ProblemsService);
  private tagsService = inject(TagsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private difficultyService = inject(DifficultyService);

  // Form
  problemForm: FormGroup;

  // Signals
  problemId = signal<number | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  allTags = signal<Tag[]>([]);

  // Computed values
  difficulties = computed(() => this.difficultyService.getAllDifficulties());

  isFormValid = computed(() => this.problemForm.valid && !this.isSubmitting());

  examplesCount = computed(() => this.examplesFormArray.length);

  // Form array getter
  get examplesFormArray(): FormArray {
    return this.problemForm.get('examples') as FormArray;
  }

  constructor() {
    this.problemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['', Validators.required],
      examples: this.fb.array([]),
      tags: [[]],
    });

    this.initializeComponent();
  }

  private async initializeComponent(): Promise<void> {
    await this.loadTags();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    const isEdit = this.route.snapshot.url.some(
      (segment) => segment.path === 'edit'
    );

    this.problemId.set(id);
    this.isEditMode.set(isEdit);

    if (isEdit && id) {
      await this.loadProblem();
    } else {
      this.addExample(); // Добавляем пустой пример по умолчанию
    }
  }

  private async loadProblem(): Promise<void> {
    this.isLoading.set(true);

    try {
      const problem = await this.problemsService
        .getProblem(this.problemId()!)
        .toPromise();

      if (problem) {
        this.problemForm.patchValue({
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
        });

        // Загружаем примеры
        this.examplesFormArray.clear();
        problem.examples.forEach((example: ProblemExample) => {
          this.addExample(example);
        });
      }
    } catch (error) {
      this.showError('Ошибка загрузки задачи');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadTags(): Promise<void> {
    try {
      const response = await this.tagsService.getTags().toPromise();
      if (response) {
        this.allTags.set(response.tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }

  addExample(example?: ProblemExample): void {
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

  async onSubmit(): Promise<void> {
    if (this.problemForm.valid) {
      this.isSubmitting.set(true);

      const problemData: ProblemCreate = {
        title: this.problemForm.value.title,
        description: this.problemForm.value.description,
        difficulty: this.problemForm.value.difficulty,
        examples: this.problemForm.value.examples,
        tags: this.problemForm.value.tags || [],
      };

      try {
        const request = this.isEditMode()
          ? this.problemsService.updateProblem(this.problemId()!, problemData)
          : this.problemsService.createProblem(problemData);

        const problem = await request.toPromise();

        const message = this.isEditMode()
          ? 'Задача обновлена'
          : 'Задача создана';
        this.showSuccess(message);
        this.router.navigate(['/admin/problems']);
      } catch (error: any) {
        const errorMessage = error.error?.error || 'Ошибка сохранения задачи';
        this.showError(errorMessage);
      } finally {
        this.isSubmitting.set(false);
      }
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
    return this.difficultyService.getDifficultyText(difficulty);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
