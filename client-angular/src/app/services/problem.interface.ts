export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examples: ProblemExample[];
  tags: string[];
  averageRating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemCreate {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examples?: ProblemExample[];
  tags?: string[];
}

export interface ProblemsResponse {
  problems: Problem[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
