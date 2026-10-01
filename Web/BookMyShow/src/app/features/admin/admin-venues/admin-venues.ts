import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CityService } from '../../../core/services/city';
import { VenueService } from '../../../core/services/venue';
import { ScreenService } from '../../../core/services/screen';
import { SeatService } from '../../../core/services/seat';
import { City, Venue, Screen, SeatType } from '../../../core/models/venue.model';

@Component({
  selector: 'app-admin-venues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-venues.html',
  styleUrl: './admin-venues.sass'
})
export class AdminVenues implements OnInit {
  cities = signal<City[]>([]);
  venues = signal<Venue[]>([]);
  screens = signal<Screen[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  newCityName = '';
  venueForm = { name: '', address: '', cityId: 0 };

  selectedVenueId = signal<number | null>(null);
  screenForm = { name: '' };

  selectedScreenId = signal<number | null>(null);
  seatRows = 3;
  seatsPerRow = 8;
  seatType: SeatType = SeatType.Regular;

  constructor(
    private cityService: CityService,
    private venueService: VenueService,
    private screenService: ScreenService,
    private seatService: SeatService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.cityService.getAll().subscribe({
      next: (cities) => {
        this.cities.set(cities);
        if (cities.length && !this.venueForm.cityId) this.venueForm.cityId = cities[0].id;
        this.loadVenues();
      },
      error: () => { this.error.set('Failed to load cities.'); this.loading.set(false); }
    });
  }

  loadVenues(): void {
    this.venueService.getAll().subscribe({
      next: (venues) => { this.venues.set(venues); this.loading.set(false); },
      error: () => { this.error.set('Failed to load venues.'); this.loading.set(false); }
    });
  }

  addCity(): void {
    if (!this.newCityName.trim()) return;
    this.cityService.create({ name: this.newCityName.trim() }).subscribe({
      next: () => { this.newCityName = ''; this.load(); },
      error: () => this.error.set('Failed to add city.')
    });
  }

  addVenue(): void {
    if (!this.venueForm.name.trim() || !this.venueForm.cityId) return;
    this.venueService.create({ ...this.venueForm }).subscribe({
      next: () => {
        this.venueForm = { name: '', address: '', cityId: this.cities()[0]?.id ?? 0 };
        this.loadVenues();
      },
      error: () => this.error.set('Failed to add venue.')
    });
  }

  cityName(cityId: number): string {
    return this.cities().find(c => c.id === cityId)?.name ?? '—';
  }

  // ---------- Screens ----------

  manageScreens(venueId: number): void {
    this.selectedVenueId.set(venueId);
    this.selectedScreenId.set(null);
    this.loadScreens(venueId);
  }

  loadScreens(venueId: number): void {
    this.screenService.getAll(venueId).subscribe({
      next: (screens) => this.screens.set(screens),
      error: () => this.error.set('Failed to load screens.')
    });
  }

  addScreen(): void {
    const venueId = this.selectedVenueId();
    if (!venueId || !this.screenForm.name.trim()) return;

    this.screenService.create({ name: this.screenForm.name.trim(), venueId }).subscribe({
      next: () => { this.screenForm.name = ''; this.loadScreens(venueId); },
      error: () => this.error.set('Failed to add screen.')
    });
  }

  // ---------- Seats ----------

  manageSeats(screenId: number): void {
    this.selectedScreenId.set(screenId);
  }

  generateSeats(): void {
    const screenId = this.selectedScreenId();
    if (!screenId) return;

    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seats = [];
    for (let r = 0; r < this.seatRows; r++) {
      for (let n = 1; n <= this.seatsPerRow; n++) {
        seats.push({
          row: rowLetters[r],
          number: n,
          seatType: this.seatType,
          screenId
        });
      }
    }

    this.seatService.createBulk(seats).subscribe({
      next: () => alert(`${seats.length} seats created.`),
      error: () => this.error.set('Failed to create seats.')
    });


    
  }

  venueName(id: number): string {
  return this.venues().find(v => v.id === id)?.name ?? '—';
}

screenName(id: number): string {
  return this.screens().find(s => s.id === id)?.name ?? '—';
}
}