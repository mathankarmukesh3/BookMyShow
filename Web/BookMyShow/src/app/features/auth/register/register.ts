import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.sass'
})
export class Register {
  name = '';
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        // Registration succeeded but doesn't log the user in automatically —
        // send them to login to authenticate with their new credentials.
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 409 ? 'An account with this email already exists.' : 'Something went wrong. Try again.'
        );
      }
    });
  }
}