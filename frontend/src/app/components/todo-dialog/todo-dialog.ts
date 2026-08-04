import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Observable } from 'rxjs';
import { Todo, TodoDto } from '../../services/todo';

export interface TodoDialogData {
  todo?: TodoDto;
}

@Component({
  selector: 'app-todo-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'tr-TR' }
  ],
  templateUrl: './todo-dialog.html',
  styleUrl: './todo-dialog.scss'
})
export class TodoDialog {
  private todoService = inject(Todo);
  private dialogRef = inject(MatDialogRef<TodoDialog>);
  data = inject<TodoDialogData>(MAT_DIALOG_DATA);

  isEdit = !!this.data?.todo;
  saving = signal(false);

  title = this.data?.todo?.title ?? '';
  description = this.data?.todo?.description ?? '';
  dueDate: Date | null = this.data?.todo?.dueDate ? new Date(this.data.todo.dueDate) : null;

  private toIsoDate(date: Date | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  save(): void {
    if (!this.title.trim() || this.saving()) return;
    this.saving.set(true);

    const request$: Observable<unknown> = this.isEdit
      ? this.todoService.update({
          id: this.data.todo!.id,
          title: this.title,
          description: this.description || null,
          isCompleted: this.data.todo!.isCompleted,
          dueDate: this.toIsoDate(this.dueDate)
        })
      : this.todoService.create({
          title: this.title,
          description: this.description || null,
          dueDate: this.toIsoDate(this.dueDate)
        });

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.saving.set(false)
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}