import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Problem,
  ProblemCreate,
  ProblemsResponse,
} from '../interfaces/problem.interface';

@Injectable({
  providedIn: 'root',
})
export class ProblemsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getProblems(params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    tags?: string;
    minRating?: number;
    maxRating?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<ProblemsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProblemsResponse>(`${this.apiUrl}/problems`, {
      params: httpParams,
    });
  }

  getProblem(id: number): Observable<Problem> {
    return this.http.get<Problem>(`${this.apiUrl}/problems/${id}`);
  }

  createProblem(problem: ProblemCreate): Observable<Problem> {
    return this.http.post<Problem>(`${this.apiUrl}/problems`, problem);
  }

  updateProblem(id: number, problem: ProblemCreate): Observable<Problem> {
    return this.http.put<Problem>(`${this.apiUrl}/problems/${id}`, problem);
  }

  deleteProblem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/problems/${id}`);
  }
}
