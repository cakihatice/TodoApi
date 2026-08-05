import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [
    FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.scss'
})
export class ProfileDialog implements OnInit {
  private auth = inject(Auth);
  private snackBar = inject(MatSnackBar);
  dialogRef = inject(MatDialogRef<ProfileDialog>);

  loading = signal(true);
  saving = signal(false);

  displayName = '';
  email = '';
  photoBase64 = signal<string | null>(null);
  emailConfirmed = signal(false);

  currentPassword = '';
  newPassword = '';

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (p) => {
        this.displayName = p.displayName;
        this.email = p.email;
        this.photoBase64.set(p.photoBase64);
        this.emailConfirmed.set(p.emailConfirmed);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Profil yüklenemedi.', 'Tamam', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Lütfen bir resim dosyası seç.', 'Tamam', { duration: 3000 });
      return;
    }
    if (file.size > 1024 * 1024) {
      this.snackBar.open('Dosya en fazla 1 MB olabilir.', 'Tamam', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.photoBase64.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  save() {
    if (this.saving()) return;

    if (this.newPassword && !this.currentPassword) {
      this.snackBar.open('Şifre değiştirmek için mevcut şifreni gir.', 'Tamam', { duration: 3000 });
      return;
    }

    this.saving.set(true);
    this.auth.updateProfile({
      email: this.email,
      photoBase64: this.photoBase64(),
      newPassword: this.newPassword || null,
      currentPassword: this.currentPassword || null
    }).subscribe({
      next: () => {
        this.snackBar.open('Profil güncellendi.', 'Tamam', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Güncelleme başarısız. Bilgileri kontrol et.', 'Tamam', { duration: 3000 });
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}