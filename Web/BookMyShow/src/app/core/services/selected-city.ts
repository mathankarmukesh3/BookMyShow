import { Injectable, signal } from '@angular/core';
import { City } from '../models/venue.model';

const STORAGE_KEY = 'bms.selectedCity';

/**
 * Holds the city the user is currently browsing in.
 * The navbar sets it; the movie list and showtimes pages read it.
 */
@Injectable({ providedIn: 'root' })
export class SelectedCityService {
  readonly city = signal<City | null>(this.load());

  select(city: City | null): void {
    this.city.set(city);
    try {
      if (city) localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage not available */ }
  }

  private load(): City | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as City) : null;
    } catch {
      return null;
    }
  }
}