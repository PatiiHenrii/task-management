import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/services/auth.service';
import { TaskInput, TaskItem, TaskService, TaskStatus } from '../../core/services/task.service';
import { BrandMarkComponent } from '../../shared/components/brand-mark.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { TaskFormComponent } from './task-form.component';

type TaskStatusFilter = TaskStatus | 'ALL';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [DatePipe, RouterLink, BrandMarkComponent, MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  private readonly tasksApi = inject(TaskService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  tasks: TaskItem[] = [];
  statusFilter: TaskStatusFilter = 'ALL';
  loading = false;
  errorMessage = '';

  get filteredTasks(): TaskItem[] {
    return this.statusFilter === 'ALL'
      ? this.tasks
      : this.tasks.filter((task) => task.status === this.statusFilter);
  }

  ngOnInit(): void { this.loadTasks(); }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.tasksApi.list().subscribe({
      next: (tasks) => { this.tasks = tasks; this.loading = false; },
      error: () => { this.loading = false; this.errorMessage = 'Could not load tasks. Please try again.'; }
    });
  }

  statusLabel(status: TaskStatus): string {
    return status === 'TODO' ? 'To do' : status === 'IN_PROGRESS' ? 'In progress' : 'Done';
  }

  openCreateDialog(): void {
    this.dialog.open(TaskFormComponent, { width: '520px', maxWidth: 'calc(100vw - 32px)', data: {} })
      .afterClosed().subscribe((task: TaskInput | undefined) => {
        if (task) this.saveTask(task);
      });
  }

  openEditDialog(task: TaskItem): void {
    this.dialog.open(TaskFormComponent, { width: '520px', maxWidth: 'calc(100vw - 32px)', data: { task } })
      .afterClosed().subscribe((updated: TaskInput | undefined) => {
        if (updated) this.saveTask(updated, task.id);
      });
  }

  confirmDelete(task: TaskItem): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      maxWidth: 'calc(100vw - 32px)',
      data: { title: 'Delete task?', message: `“${task.title}” will be permanently deleted.`, confirmLabel: 'Delete task' }
    }).afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed) this.deleteTask(task);
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  private saveTask(task: TaskInput, id?: number): void {
    this.errorMessage = '';
    const request$ = id === undefined ? this.tasksApi.create(task) : this.tasksApi.update(id, task);
    request$.subscribe({
      next: (saved) => {
        if (id === undefined) this.tasks = [saved, ...this.tasks];
        else this.tasks = this.tasks.map((current) => current.id === id ? saved : current);
      },
      error: () => { this.errorMessage = 'Could not save the task. Please try again.'; }
    });
  }

  private deleteTask(task: TaskItem): void {
    this.errorMessage = '';
    this.tasksApi.remove(task.id).subscribe({
      next: () => { this.tasks = this.tasks.filter((current) => current.id !== task.id); },
      error: () => { this.errorMessage = 'Could not delete the task. Please try again.'; }
    });
  }
}
