import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Todo, TodoDto } from '../../services/todo';
import { Header } from '../../components/header/header';
import { TodoDialog } from '../../components/todo-dialog/todo-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
@Component({
  selector: 'app-todo-list',
  imports: [DatePipe, MatIconModule, MatButtonModule, Header],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss'
})
export class TodoList implements OnInit {
  private todoService = inject(Todo);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  todos = signal<TodoDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.loading.set(true);
    this.todoService.getAll().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.error.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Todo\'lar yüklenemedi.');
        this.loading.set(false);
      }
    });
  }

  openAddDialog() {
    const ref = this.dialog.open(TodoDialog, { data: {}, width: '420px' });
    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadTodos();
    });
  }

  openEditDialog(todo: TodoDto) {
    const ref = this.dialog.open(TodoDialog, { data: { todo }, width: '420px' });
    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadTodos();
    });
  }

  toggleComplete(todo: TodoDto) {
    this.todoService.update({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      isCompleted: !todo.isCompleted,
      dueDate: todo.dueDate
    }).subscribe(() => this.loadTodos());
  }

  deletingIds = signal<Set<string>>(new Set());

deleteTodo(id: string) {
    if (this.deletingIds().has(id)) return;

    const ref = this.dialog.open(ConfirmDialog, {
      data: { message: 'Bu todo silinsin mi?' },
      width: '360px'
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.deletingIds.update(s => new Set(s).add(id));
      this.todoService.delete(id).subscribe({
        next: () => {
          this.clearDeleting(id);
          this.snackBar.open('Todo silindi.', 'Tamam', { duration: 3000 });
          this.loadTodos();
        },
        error: () => {
          this.clearDeleting(id);
          this.snackBar.open('Todo silinemedi.', 'Tamam', { duration: 3000 });
        }
      });
    });
  }

  private clearDeleting(id: string) {
    this.deletingIds.update(s => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  }
}