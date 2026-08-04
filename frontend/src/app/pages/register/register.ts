import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Logo } from '../../components/logo/logo';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, Logo],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);

  displayName = ''
  email = '';
  password = '';
  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);

submit() {
    if (this.loading()) return;          // çift tıklama kilidi
    this.error.set(null);
    this.loading.set(true);

    const password = this.password;
    this.password = '';                   // şifreyi hemen bellekten temizle

    this.auth.register(this.displayName, this.email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Kayıt başarısız. E-posta zaten var olabilir veya şifre kurallarına uymuyor.');
      }
    });
  }
}