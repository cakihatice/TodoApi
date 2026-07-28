import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  submit() {
    this.error.set(null);
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/todos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Giriş başarısız. E-posta veya şifreyi kontrol et.');
      }
    });
  }
}