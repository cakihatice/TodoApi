import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.scss'
})
export class ProfileDialog {
  private auth = inject(Auth);
  dialogRef = inject(MatDialogRef<ProfileDialog>);

  displayName = this.auth.getDisplayName();

  close(): void {
    this.dialogRef.close();
  }
}