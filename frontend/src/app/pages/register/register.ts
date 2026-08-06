import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Logo } from '../../components/logo/logo';
import { sha256 } from '../../utils/hash';

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

async submit() {
  if (this.loading()) return;
  this.error.set(null);

  // E-posta format kontrolü (asıl MX kontrolü sunucuda)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email);
  if (!emailOk) {
    this.error.set('Geçerli bir e-posta adresi girin.');
    return;
  }

  // Şifre gücü kontrolü (sunucu artık asıl şifreyi görmüyor)
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
  if (!strong.test(this.password)) {
    this.error.set('Şifre en az 6 karakter olmalı; büyük harf, küçük harf, sayı ve özel karakter içermeli.');
    return;
  }

  this.loading.set(true);
  const hashed = await sha256(this.password);
  this.password = '';

  this.auth.register(this.displayName, this.email, hashed).subscribe({
    next: () => {
      this.loading.set(false);
      this.success.set(true);
      setTimeout(() => this.router.navigate(['/login']), 1500);
    },
    error: (err) => {
      this.loading.set(false);
      this.error.set(err?.error?.message ?? 'Kayıt başarısız. Lütfen bilgileri kontrol et.');
    }
  });
}
}