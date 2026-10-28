import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CityService } from '../../../core/services/city';
import { SelectedCityService } from '../../../core/services/selected-city';
import { UserRole } from '../../../core/models/user.model';
import { City } from '../../../core/models/venue.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.sass'
})
export class Navbar implements OnInit {
  UserRole = UserRole;
  cities = signal<City[]>([]);

  constructor(
    public auth: AuthService,
    public selectedCity: SelectedCityService,
    private cityService: CityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cityService.getAll().subscribe({
      next: (cities) => {
        this.cities.set(cities);
        const current = this.selectedCity.city();
        const stillExists = current && cities.some(c => c.id === current.id);
        // First visit, or the saved city was deleted by admin → pick the first city
        if (!stillExists) this.selectedCity.select(cities[0] ?? null);
      }
    });
  }

  onCityChange(value: string): void {
    const city = this.cities().find(c => c.id === Number(value)) ?? null;
    this.selectedCity.select(city);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}