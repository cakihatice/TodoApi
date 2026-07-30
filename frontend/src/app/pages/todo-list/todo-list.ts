import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Todo, TodoDto } from '../../services/todo';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule, DatePipe],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss'
})
export class TodoList implements OnInit {
  private todoService = inject(Todo);
  auth = inject(Auth);
  private router = inject(Router);

  todos = signal<TodoDto[]>([]);
  newTitle = '';
  newDescription = '';
  newDueDate = '';
  loading = signal(false);
  error = signal<string | null>(null);

  editingId = signal<string | null>(null);
  editTitle = '';
  editDescription = '';
  editDueDate = '';

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.loading.set(true);
    this.todoService.getAll().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Todo\'lar yüklenemedi.');
        this.loading.set(false);
      }
    });
  }

  addTodo() {
    if (!this.newTitle.trim()) return;
    this.todoService.create({
      title: this.newTitle,
      description: this.newDescription || null,
      dueDate: this.newDueDate || null
    }).subscribe(() => {
      this.newTitle = '';
      this.newDescription = '';
      this.newDueDate = '';
      this.loadTodos();
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

  startEdit(todo: TodoDto) {
    this.editingId.set(todo.id);
    this.editTitle = todo.title;
    this.editDescription = todo.description || '';
    this.editDueDate = todo.dueDate ? todo.dueDate.substring(0, 10) : '';
  }

  saveEdit(todo: TodoDto) {
    if (!this.editTitle.trim()) return;
    this.todoService.update({
      id: todo.id,
      title: this.editTitle,
      description: this.editDescription || null,
      isCompleted: todo.isCompleted,
      dueDate: this.editDueDate || null
    }).subscribe(() => {
      this.editingId.set(null);
      this.loadTodos();
    });
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}