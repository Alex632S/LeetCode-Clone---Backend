import { Injectable } from '@angular/core';

export interface DifficultyInfo {
  value: string;
  label: string;
  color: string;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class DifficultyService {
  private difficulties: Map<string, DifficultyInfo> = new Map([
    ['easy', { value: 'easy', label: 'Легкая', color: '#4CAF50', order: 1 }],
    [
      'medium',
      { value: 'medium', label: 'Средняя', color: '#FF9800', order: 2 },
    ],
    ['hard', { value: 'hard', label: 'Сложная', color: '#F44336', order: 3 }],
  ]);

  getDifficultyColor(difficulty: string): string {
    return this.difficulties.get(difficulty)?.color || '#757575';
  }

  getDifficultyText(difficulty: string): string {
    return this.difficulties.get(difficulty)?.label || difficulty;
  }

  getAllDifficulties(): DifficultyInfo[] {
    return Array.from(this.difficulties.values()).sort(
      (a, b) => a.order - b.order
    );
  }

  getDifficultyInfo(difficulty: string): DifficultyInfo | undefined {
    return this.difficulties.get(difficulty);
  }

  isValidDifficulty(difficulty: string): boolean {
    return this.difficulties.has(difficulty);
  }
}
