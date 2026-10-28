import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ShowService } from '../../../core/services/show';
import { MovieService } from '../../../core/services/movie';
import { SelectedCityService } from '../../../core/services/selected-city';
import { Show } from '../../../core/models/show.model';
import { Movie } from '../../../core/models/movie.model';

interface ScreenGroup { screenId: number; screenName: string; shows: Show[]; }
interface VenueGroup  { venueId: number; venueName: string; address: string; screens: ScreenGroup[]; }

@Component({
  selector: 'app-show-times',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './show-times.html',
  styleUrl: './show-times.sass'
})
export class ShowTimes {
  private route = inject(ActivatedRoute);
  private showService = inject(ShowService);
  private movieService = inject(MovieService);
  readonly selectedCity = inject(SelectedCityService);

  movie = signal<Movie | null>(null);
  shows = signal<Show[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedDate = signal<string | null>(null);

  dates = computed(() =>
    [...new Set(this.shows().map(s => this.dayKey(s.startTime)))].sort()
  );

  venues = computed<VenueGroup[]>(() => {
    const day = this.selectedDate();
    const map = new Map<number, VenueGroup>();

    for (const show of this.shows()) {
      if (this.dayKey(show.startTime) !== day) continue;

      const venue = show.screen?.venue;
      const venueId = venue?.id ?? show.screen?.venueId ?? 0;

      let vg = map.get(venueId);
      if (!vg) {
        vg = { venueId, venueName: venue?.name ?? 'Theatre', address: venue?.address ?? '', screens: [] };
        map.set(venueId, vg);
      }

      let sg = vg.screens.find(s => s.screenId === show.screenId);
      if (!sg) {
        sg = { screenId: show.screenId, screenName: show.screen?.name ?? 'Screen', shows: [] };
        vg.screens.push(sg);
      }
      sg.shows.push(show);
    }
    return [...map.values()].sort((a, b) => a.venueName.localeCompare(b.venueName));
  });

  constructor() {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));
    if (!movieId) {
      this.error.set('Invalid movie.');
      this.loading.set(false);
      return;
    }

    this.movieService.getById(movieId).subscribe(m => this.movie.set(m));

    toObservable(this.selectedCity.city).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(city => {
        if (!city) return of<Show[]>([]);
        return this.showService.getAll(movieId, city.id, true).pipe(
          catchError(() => { this.error.set('Could not load showtimes.'); return of<Show[]>([]); })
        );
      }),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(shows => {
      this.shows.set(shows);
      this.selectedDate.set(this.dates()[0] ?? null);
      this.loading.set(false);
    });
  }

  selectDate(day: string): void {
    this.selectedDate.set(day);
  }

  private dayKey(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  dayToDate(day: string): Date {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
}