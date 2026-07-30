import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
}

export interface UpdateTodoRequest {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
}

@Injectable({ providedIn: 'root' })
export class Todo {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/todo`;

  getAll(): Observable<TodoDto[]> {
    return this.http.get<TodoDto[]>(this.apiUrl);
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