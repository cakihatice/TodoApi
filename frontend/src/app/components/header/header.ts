import { Component, inject } from '@angular/core';
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
export class Header {
  private router = inject(Router);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);

  displayName = this.auth.getDisplayName();

  get initial(): string {
    return this.displayName?.charAt(0).toUpperCase() ?? '?';
  }

  goHome(): void {
    this.router.navigate(['/todos']);
  }

  openProfile(): void {
    this.dialog.open(ProfileDialog, { width: '400px' });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}