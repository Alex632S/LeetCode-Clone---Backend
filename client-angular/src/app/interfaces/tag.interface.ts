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

export interface TagsResponse {
  tags: Tag[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
