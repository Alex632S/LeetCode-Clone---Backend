export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'interviewer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
