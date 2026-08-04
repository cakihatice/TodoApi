import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Todo, TodoDto } from '../../services/todo';
import { Header } from '../../components/header/header';
import { TodoDialog } from '../../components/todo-dialog/todo-dialog';

@Component({
  selector: 'app-todo-list',
  imports: [DatePipe, MatIconModule, MatButtonModule, Header],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss'
})
export class TodoList implements OnInit {
  private todoService = inject(Todo);
  private dialog = inject(MatDialog);

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

  deleteTodo(id: string) {
    this.todoService.delete(id).subscribe(() => this.loadTodos());
  }
}