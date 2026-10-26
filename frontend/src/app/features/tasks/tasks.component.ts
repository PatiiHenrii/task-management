import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TaskInput, TaskItem, TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { BrandMarkComponent } from '../../shared/components/brand-mark.component';

@Component({
  selector: 'app-tasks', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, BrandMarkComponent, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="page-shell">
      <header class="topbar"><a class="wordmark" routerLink="/tasks"><app-brand-mark /> taskly</a><button mat-button (click)="logout()">Sign out</button></header>
      <main class="content">
        <div class="page-heading"><div><p class="eyebrow">YOUR WORKSPACE</p><h1>My tasks</h1><p class="subheading">A little progress adds up.</p></div><span class="task-count">{{ tasks.length }} tasks</span></div>
        <mat-card class="create-card"><h2>Add a task</h2><form [formGroup]="form" (ngSubmit)="addTask()" class="task-form">
          <mat-form-field appearance="outline" class="title-field"><mat-label>What needs to get done?</mat-label><input matInput formControlName="title" maxlength="255"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select formControlName="status"><mat-option value="PENDING">To do</mat-option><mat-option value="IN_PROGRESS">In progress</mat-option><mat-option value="COMPLETED">Completed</mat-option></mat-select></mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving">Add task</button>
        </form></mat-card>
        @if (errorMessage) { <p class="error-message" role="alert">{{ errorMessage }}</p> }
        <section class="task-list" aria-label="Task list">
          @for (task of tasks; track task.id) {
            <mat-card class="task-card"><div class="task-copy"><span class="status-dot" [class.done]="task.status === 'COMPLETED'"></span><div><h3>{{ task.title }}</h3><p>{{ task.description || statusLabel(task.status) }}</p></div></div><button mat-icon-button aria-label="Delete task" (click)="deleteTask(task.id)"><mat-icon>delete_outline</mat-icon></button></mat-card>
          } @empty { <div class="empty-state"><div class="empty-icon">✦</div><h2>Nothing on your list yet</h2><p>Add your first task above and make today count.</p></div> }
        </section>
      </main>
    </div>
  `,
  styles: [`
    .page-shell { min-height: 100vh; background: #f7f8fc; } .topbar { height: 68px; display: flex; align-items: center; justify-content: space-between; padding: 0 max(24px, calc((100% - 960px) / 2)); background: #fff; border-bottom: 1px solid #eceef4; }
    .wordmark { display: flex; gap: 10px; align-items: center; color: #252638; text-decoration: none; font-size: 18px; font-weight: 700; letter-spacing: -.04em; }.brand-mark { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: #5148cf; color: white; }
    .content { width: min(100% - 40px, 760px); margin: 56px auto; }.page-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 28px; }.eyebrow { color: #6258c9; font-size: 11px; letter-spacing: .14em; font-weight: 700; margin: 0 0 9px; }h1 { font-size: 34px; letter-spacing: -.05em; margin: 0; }.subheading { margin: 8px 0 0; color: #74798a; }.task-count { color: #74798a; font-size: 13px; padding-bottom: 5px; }
    .create-card { padding: 22px 24px 8px; border-radius: 16px; margin-bottom: 18px; }.create-card h2 { margin: 0 0 14px; font-size: 15px; }.task-form { display: grid; grid-template-columns: 1fr 160px auto; align-items: start; gap: 12px; }.task-form button { height: 56px; border-radius: 10px; padding: 0 22px; }.task-form mat-form-field { width: 100%; }
    .task-list { display: grid; gap: 10px; }.task-card { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-radius: 14px; }.task-copy { display: flex; align-items: center; gap: 14px; }.status-dot { width: 10px; height: 10px; border: 2px solid #8077dc; border-radius: 50%; flex: 0 0 auto; }.status-dot.done { background: #38a681; border-color: #38a681; }.task-card h3 { font-size: 14px; margin: 0 0 4px; }.task-card p { font-size: 12px; color: #818596; margin: 0; }.empty-state { text-align: center; padding: 64px 20px; color: #777b8d; }.empty-state h2 { color: #272839; font-size: 17px; margin: 14px 0 6px; }.empty-state p { margin: 0; font-size: 13px; }.empty-icon { margin: auto; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 15px; background: #eeedff; color: #6258c9; font-size: 24px; }.error-message { color: #b3261e; }
    @media (max-width: 650px) { .content { margin: 36px auto; }.task-form { grid-template-columns: 1fr; gap: 0; }.task-form button { width: 100%; margin: 0 0 14px; }.create-card { padding: 20px 18px 2px; } }
  `]
})
export class TasksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tasksApi = inject(TaskService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({ title: ['', Validators.required], status: ['PENDING'] });
  tasks: TaskItem[] = [];
  saving = false;
  errorMessage = '';

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.tasksApi.list().subscribe({ next: (tasks) => { this.tasks = tasks; }, error: () => { this.errorMessage = 'Could not load tasks. Please try again.'; } });
  }

  addTask(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const value = this.form.getRawValue();
    const task: TaskInput = { title: value.title.trim(), description: '', status: value.status, dueDate: null };
    this.tasksApi.create(task).subscribe({ next: () => { this.form.reset({ title: '', status: 'PENDING' }); this.saving = false; this.refresh(); }, error: () => { this.saving = false; this.errorMessage = 'Could not save the task. Please try again.'; } });
  }

  deleteTask(id: number): void { this.tasksApi.remove(id).subscribe({ next: () => { this.tasks = this.tasks.filter((task) => task.id !== id); }, error: () => { this.errorMessage = 'Could not delete the task. Please try again.'; } }); }
  statusLabel(status: string): string { return status.replaceAll('_', ' ').toLowerCase(); }
  logout(): void { this.auth.logout(); void this.router.navigate(['/login']); }
}
