import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface TodoDto {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  dueDate: string | null;
}

export interface CreateTodoRequest {
  title: string;
  description: string | null;
  dueDate: string | null;
  requestId: string;
}

export interface UpdateTodoRequest {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
}
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class Todo {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/todo`;

  getPaged(pageNumber: number, pageSize: number): Observable<PagedResult<TodoDto>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<PagedResult<TodoDto>>(this.apiUrl, { params });
  }

  create(data: CreateTodoRequest): Observable<string> {
    return this.http.post<string>(this.apiUrl, data);
  }

  update(data: UpdateTodoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${data.id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}