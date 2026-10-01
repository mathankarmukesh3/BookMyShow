import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.sass'
})
export class Login {
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const destination = res.user.role === UserRole.Admin ? '/admin/movies' : '/movies';
        this.router.navigate([destination]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 401 ? 'Invalid email or password.' : 'Something went wrong. Try again.'
        );
      }
    });
  }
}