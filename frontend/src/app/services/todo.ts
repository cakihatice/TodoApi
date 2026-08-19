import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TodoDto, CreateTodoRequest, UpdateTodoRequest } from '../interfaces/todo.interface';
import { PagedResult } from '../interfaces/paged-result.interface';

// Component'lerin eski import yolları bozulmasın diye re-export
export type { TodoDto, CreateTodoRequest, UpdateTodoRequest } from '../interfaces/todo.interface';
export type { PagedResult } from '../interfaces/paged-result.interface';

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