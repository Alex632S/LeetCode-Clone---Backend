import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, TagCreate, TagsResponse } from '../interfaces/tag.interface';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTags(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<TagsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<TagsResponse>(`${this.apiUrl}/tags`, {
      params: httpParams,
    });
  }

  getPopularTags(): Observable<TagsResponse> {
    return this.http.get<TagsResponse>(`${this.apiUrl}/tags/popular`);
  }

  createTag(tag: TagCreate): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/tags`, tag);
  }

  updateTag(id: number, tag: TagCreate): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/tags/${id}`, tag);
  }

  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tags/${id}`);
  }
}
