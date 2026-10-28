import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: Date | null;
}

interface ApiTaskItem extends Omit<TaskItem, 'status'> { status: string; }
interface ApiTaskInput extends Omit<TaskInput, 'status' | 'dueDate'> { status: string; dueDate: string | null; }

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/tasks';

  list(): Observable<TaskItem[]> {
    return this.http.get<ApiTaskItem[]>(this.apiUrl).pipe(map((tasks) => tasks.map((task) => this.fromApi(task))));
  }

  create(task: TaskInput): Observable<TaskItem> {
    return this.http.post<ApiTaskItem>(this.apiUrl, this.toApi(task)).pipe(map((created) => this.fromApi(created)));
  }

  update(id: number, task: TaskInput): Observable<TaskItem> {
    return this.http.put<ApiTaskItem>(`${this.apiUrl}/${id}`, this.toApi(task)).pipe(map((updated) => this.fromApi(updated)));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private fromApi(task: ApiTaskItem): TaskItem {
    const status: TaskStatus = task.status === 'COMPLETED' || task.status === 'DONE'
      ? 'DONE'
      : task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO';
    return { ...task, status };
  }

  private toApi(task: TaskInput): ApiTaskInput {
    const status = task.status === 'DONE' ? 'COMPLETED' : task.status === 'TODO' ? 'PENDING' : task.status;
    return {
      title: task.title.trim(),
      description: task.description.trim(),
      status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null
    };
  }
}
