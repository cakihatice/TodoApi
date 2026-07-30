import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Todo, TodoDto } from '../../services/todo';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css'
})
export class TodoList implements OnInit {
  private todoService = inject(Todo);
  private auth = inject(Auth);
  private router = inject(Router);

  todos = signal<TodoDto[]>([]);
  newTitle = '';
  newDescription = '';
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
      description: this.newDescription || null
    }).subscribe(() => {
      this.newTitle = '';
      this.newDescription = '';
      this.loadTodos();
    });
  }

  toggleComplete(todo: TodoDto) {
    this.todoService.update({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      isCompleted: !todo.isCompleted
    }).subscribe(() => this.loadTodos());
  }

  deleteTodo(id: string) {
    this.todoService.delete(id).subscribe(() => this.loadTodos());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}