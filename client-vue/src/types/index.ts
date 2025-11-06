export interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'interviewer' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Problem {
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  examples: Example[]
  tags: string[]
  averageRating: number
  ratingCount: number
  createdAt: string
  updatedAt: string
}

export interface Example {
  input: string
  output: string
  explanation?: string
}

export interface ProblemCreate {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  examples?: Omit<Example, 'id'>[]
  tags?: string[]
}

export interface Comment {
  id: number
  content: string
  userId: number
  problemId: number
  parentId: number | null
  user: User
  replies: Comment[]
  createdAt: string
  updatedAt: string
}

export interface CommentCreate {
  content: string
  problemId: number
  parentId?: number | null
}

export interface Rating {
  id: number
  userId: number
  problemId: number
  value: number
  createdAt: string
  updatedAt: string
}

export interface RatingCreate {
  problemId: number
  value: number
}

export interface RatingResponse {
  rating: Rating
  averageRating: number
  ratingCount: number
}

export interface Tag {
  id: number
  name: string
  description?: string
  color?: string
  createdAt: string
}

export interface TagCreate {
  name: string
  description?: string
  color?: string
}

export interface File {
  id: number
  filename: string
  originalName: string
  path: string
  problemId: number
  uploadedBy: number
  fileSize: number
  mimeType: string
  description?: string
  createdAt: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role?: 'user' | 'interviewer' | 'admin'
}

export interface ProblemFilters {
  search?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  minRating?: number
  maxRating?: number
  sortBy?: 'title' | 'difficulty' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginatedResponse {
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ProblemsResponse extends PaginatedResponse {
  problems: Problem[]
}

export interface CommentsResponse extends PaginatedResponse {
  comments: Comment[]
}

export interface TagsResponse extends PaginatedResponse {
  tags: Tag[]
}

export interface FilesResponse extends PaginatedResponse {
  files: File[]
}

export interface StatsResponse {
  totalProblems: number
  byDifficulty: {
    easy: number
    medium: number
    hard: number
  }
  popularTags: Array<{
    tag: string
    count: number
  }>
  totalTags: number
}

export interface ErrorResponse {
  error: string
  code?: string
  details?: any
}
