import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Logo } from '../../components/logo/logo';
import { sha256 } from '../../utils/hash';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Logo],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

async submit() {
  if (this.loading()) return;
  this.error.set(null);
  this.loading.set(true);

  const hashed = await sha256(this.password);
  this.password = '';

  this.auth.login(this.email, hashed).subscribe({
    next: () => {
      this.loading.set(false);
      this.router.navigate(['/todos']);
    },
    error: () => {
      this.loading.set(false);
      this.error.set('Giriş başarısız. E-posta veya şifreyi kontrol et.');
    }
  });
}
}