import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaskInput, TaskItem, TaskStatus } from '../../core/services/task.service';

export interface TaskFormDialogData { task?: TaskItem; }

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<TaskFormComponent, TaskInput | undefined>);

  readonly form = this.fb.nonNullable.group({
    title: [this.data.task?.title ?? '', [Validators.required, Validators.maxLength(255)]],
    description: [this.data.task?.description ?? '', Validators.maxLength(10000)],
    status: [this.data.task?.status ?? ('TODO' as TaskStatus)],
    dueDate: new FormControl<Date | null>(this.data.task?.dueDate ? new Date(this.data.task.dueDate) : null)
  });

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.dialogRef.close({
      title: value.title,
      description: value.description,
      status: value.status,
      dueDate: value.dueDate
    });
  }
}
