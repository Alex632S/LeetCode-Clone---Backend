import axios from "axios";
import type {
  User,
  UserUpdateRequest,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Problem,
  ProblemCreate,
  ProblemsResponse,
  StatsResponse,
  Rating,
  RatingCreate,
  RatingResponse,
  Comment,
  CommentCreate,
  CommentsResponse,
  Tag,
  TagCreate,
  TagsResponse,
  UserResponse,
  UsersResponse,
  UserStatsResponse,
} from "../types";

const API_BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Автоматически добавляем токен к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", credentials),
  register: (userData: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", userData),
  getMe: () => api.get<UserResponse>("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const usersAPI = {
  getAll: (params?: any) => api.get<UsersResponse>("/users", { params }),
  getById: (id: number) => api.get<User>(`/users/${id}`), // Возвращает User напрямую
  update: (id: number, userData: UserUpdateRequest) =>
    api.put<User>(`/users/${id}`, userData),
  getStats: (id: number) => api.get<UserStatsResponse>(`/users/${id}/stats`),
  getSolvedProblems: (id: number, params?: any) =>
    api.get(`/users/${id}/solved-problems`, { params }),
};

export const problemsAPI = {
  getAll: (params?: any) => api.get<ProblemsResponse>("/problems", { params }),
  getById: (id: number) => api.get<Problem>("/problems/${id}"),
  create: (problemData: ProblemCreate) =>
    api.post<Problem>("/problems", problemData),
  update: (id: number, problemData: ProblemCreate) =>
    api.put<Problem>(`/problems/${id}`, problemData),
  delete: (id: number) => api.delete(`/problems/${id}`),
  getStats: () => api.get<StatsResponse>("/problems/stats/overview"),
};

export const ratingsAPI = {
  rateProblem: (ratingData: RatingCreate) =>
    api.post<RatingResponse>("/ratings", ratingData),
  getProblemRatings: (problemId: number) =>
    api.get<{
      averageRating: number;
      ratingCount: number;
      userRating: Rating | null;
    }>(`/ratings/problems/${problemId}`),
  getUserRating: (problemId: number) =>
    api.get<{ userRating: Rating | null }>(
      `/ratings/problems/${problemId}/my-rating`
    ),
};

export const commentsAPI = {
  create: (commentData: CommentCreate) =>
    api.post<Comment>("/comments", commentData),
  getByProblem: (problemId: number) =>
    api.get<CommentsResponse>(`/comments/problems/${problemId}`),
  update: (id: number, commentData: { content: string }) =>
    api.put<Comment>(`/comments/${id}`, commentData),
  delete: (id: number) => api.delete(`/comments/${id}`),
};

export const tagsAPI = {
  getAll: (params?: any) => api.get<TagsResponse>("/tags", { params }),
  create: (tagData: TagCreate) => api.post<Tag>("/tags", tagData),
  update: (id: number, tagData: TagCreate) =>
    api.put<Tag>(`/tags/${id}`, tagData),
  delete: (id: number) => api.delete(`/tags/${id}`),
  getPopular: () => api.get<TagsResponse>("/tags/popular"),
};

export default api;
