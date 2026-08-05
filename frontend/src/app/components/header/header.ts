import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Auth } from '../../services/auth';
import { ProfileDialog } from '../profile-dialog/profile-dialog';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  private router = inject(Router);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);

  displayName = this.auth.getDisplayName();
  photoBase64 = signal<string | null>(null);

  get initial(): string {
    return this.displayName?.charAt(0).toUpperCase() ?? '?';
  }

  ngOnInit() {
    this.loadPhoto();
  }

  private loadPhoto() {
    this.auth.getProfile().subscribe({
      next: (p) => this.photoBase64.set(p.photoBase64),
      error: () => {}
    });
  }

  goHome(): void {
    this.router.navigate(['/todos']);
  }

  openProfile(): void {
    const ref = this.dialog.open(ProfileDialog, { width: '400px' });
    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadPhoto();
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}