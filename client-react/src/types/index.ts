// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "interviewer" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  stats?: UserStats;
  bio?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface UserStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: "user" | "interviewer" | "admin";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  username?: string;
  bio?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  role?: "user" | "interviewer" | "admin";
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Problem types
export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  examples?: Example[];
  tags?: string[];
  averageRating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
}

export interface ProblemCreate {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  examples?: Example[];
  tags?: string[];
}

export interface ProblemUpdate extends ProblemCreate {
  id: number;
}

// Comment types
export interface Comment {
  id: number;
  content: string;
  userId: number;
  problemId: number;
  parentId: number | null;
  user: User;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentCreate {
  content: string;
  problemId: number;
  parentId?: number | null;
}

// Rating types
export interface Rating {
  id: number;
  userId: number;
  problemId: number;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingCreate {
  problemId: number;
  value: number;
}

export interface RatingResponse {
  rating: Rating;
  averageRating: number;
  ratingCount: number;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface TagCreate {
  name: string;
  description?: string;
  color?: string;
}

// File types
export interface File {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  problemId: number;
  uploadedBy: number;
  fileSize: number;
  mimeType: string;
  description?: string;
  createdAt: string;
}

// Pagination types
export interface PaginatedResponse {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProblemsResponse extends PaginatedResponse {
  problems: Problem[];
}

export interface CommentsResponse extends PaginatedResponse {
  comments: Comment[];
}

export interface TagsResponse extends PaginatedResponse {
  tags: Tag[];
}

export interface FilesResponse extends PaginatedResponse {
  files: File[];
}

// Stats types
export interface DifficultyStats {
  easy: number;
  medium: number;
  hard: number;
}

export interface PopularTag {
  tag: string;
  count: number;
}

export interface StatsResponse {
  totalProblems: number;
  byDifficulty: DifficultyStats;
  popularTags: PopularTag[];
  totalTags: number;
}

// Error type
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Response types for API
export interface UserResponse {
  user: User;
}

export interface UserStatsResponse {
  stats: UserStats;
}

export interface UserProfileResponse {
  user: UserProfile;
}

export interface ProblemDetailsResponse {
  problem: Problem;
  userRating?: number;
}

// API Response types
export interface UserResponse {
  user: User;
}

export interface UsersResponse extends PaginatedResponse {
  users: User[];
}

export interface UserStatsResponse {
  stats: UserStats;
}

export interface UserProfileResponse {
  user: UserProfile;
}

export interface ProblemResponse {
  problem: Problem;
}

export interface ProblemsResponse extends PaginatedResponse {
  problems: Problem[];
}
