import type { 
  User, 
  Problem, 
  ProblemCreate, 
  Comment, 
  CommentCreate, 
  Rating, 
  RatingCreate,
  ProblemFilters,
  ProblemsResponse,
  CommentsResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Tag,
  TagCreate,
  File,
  StatsResponse,
  RatingResponse
} from '@/types'

class ApiService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers)
    
    // Set Content-Type only if not already set and if we have a body
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    
    // Set Authorization header if token exists
    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP Error: ${response.status} ${response.statusText}` 
      }))
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Authentication endpoints
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me')
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    })
  }

  // Problems endpoints
  async getProblems(filters: ProblemFilters = {}): Promise<ProblemsResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','))
          }
        } else {
          params.append(key, value.toString())
        }
      }
    })
    
    const queryString = params.toString()
    const url = queryString ? `/problems?${queryString}` : '/problems'
    
    return this.request<ProblemsResponse>(url)
  }

  async getProblem(id: number): Promise<Problem> {
    return this.request<Problem>(`/problems/${id}`)
  }

  async createProblem(problem: ProblemCreate): Promise<Problem> {
    return this.request<Problem>('/problems', {
      method: 'POST',
      body: JSON.stringify(problem),
    })
  }

  async updateProblem(id: number, problem: ProblemCreate): Promise<Problem> {
    return this.request<Problem>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(problem),
    })
  }

  async deleteProblem(id: number): Promise<void> {
    return this.request<void>(`/problems/${id}`, {
      method: 'DELETE',
    })
  }

  async getProblemsStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/problems/stats/overview')
  }

  // Comments endpoints
  async getProblemComments(problemId: number): Promise<CommentsResponse> {
    return this.request<CommentsResponse>(`/comments/problems/${problemId}`)
  }

  async createComment(comment: CommentCreate): Promise<Comment> {
    return this.request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(comment),
    })
  }

  async updateComment(id: number, content: { content: string }): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    })
  }

  async deleteComment(id: number): Promise<void> {
    return this.request<void>(`/comments/${id}`, {
      method: 'DELETE',
    })
  }

  // Ratings endpoints
  async rateProblem(rating: RatingCreate): Promise<RatingResponse> {
    return this.request<RatingResponse>('/ratings', {
      method: 'POST',
      body: JSON.stringify(rating),
    })
  }

  async getProblemRatings(problemId: number): Promise<{
    averageRating: number
    ratingCount: number
    userRating: Rating | null
  }> {
    return this.request<{
      averageRating: number
      ratingCount: number
      userRating: Rating | null
    }>(`/ratings/problems/${problemId}`)
  }

  async getUserRating(problemId: number): Promise<{ userRating: Rating | null }> {
    return this.request<{ userRating: Rating | null }>(`/ratings/problems/${problemId}/my-rating`)
  }

  // Tags endpoints
  async getTags(search?: string, page?: number, limit?: number): Promise<{
    tags: Tag[]
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const url = queryString ? `/tags?${queryString}` : '/tags'

    return this.request(url)
  }

  async getPopularTags(): Promise<{
    tags: Tag[]
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }> {
    return this.request('/tags/popular')
  }

  async createTag(tag: TagCreate): Promise<Tag> {
    return this.request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    })
  }

  async updateTag(id: number, tag: TagCreate): Promise<Tag> {
    return this.request<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tag),
    })
  }

  async deleteTag(id: number): Promise<void> {
    return this.request<void>(`/tags/${id}`, {
      method: 'DELETE',
    })
  }

  // Files endpoints
  async uploadFile(formData: FormData): Promise<{ message: string; file: File }> {
    // For file uploads, we don't use the standard request method
    // because we need to handle FormData differently
    const headers: Record<string, string> = {}
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async getProblemFiles(problemId: number): Promise<{
    files: File[]
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }> {
    return this.request(`/files/problem/${problemId}`)
  }

  async downloadFile(id: number): Promise<Blob> {
    const headers = new Headers()
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    const response = await fetch(`${this.baseURL}/files/${id}/download`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }

    return response.blob()
  }

  async deleteFile(id: number): Promise<void> {
    return this.request<void>(`/files/${id}`, {
      method: 'DELETE',
    })
  }

  // Users endpoints (admin only)
  async getUsers(page?: number, limit?: number): Promise<{
    users: User[]
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const url = queryString ? `/users?${queryString}` : '/users'

    return this.request(url)
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`)
  }

  async updateUser(id: number, userData: { username?: string; role?: string }): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }
}

export const apiService = new ApiService()