import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | string;
  dueDate: string | null;
  createdAt: string;
}

export interface TaskInput { title: string; description: string; status: string; dueDate: string | null; }

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/tasks';

  list(): Observable<TaskItem[]> { return this.http.get<TaskItem[]>(this.apiUrl); }
  create(task: TaskInput): Observable<TaskItem> { return this.http.post<TaskItem>(this.apiUrl, task); }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
