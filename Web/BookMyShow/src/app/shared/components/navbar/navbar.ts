import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.sass'
})
export class Navbar {
  UserRole = UserRole; // exposed so the template can compare against it

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}