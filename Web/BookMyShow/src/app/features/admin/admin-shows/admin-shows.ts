import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../core/services/movie';
import { CityService } from '../../../core/services/city';
import { ScreenService } from '../../../core/services/screen';
import { VenueService } from '../../../core/services/venue';
import { ShowService } from '../../../core/services/show';
import { Movie } from '../../../core/models/movie.model';
import { City, Screen, Venue } from '../../../core/models/venue.model';
import { Show } from '../../../core/models/show.model';

@Component({
  selector: 'app-admin-shows',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-shows.html',
  styleUrl: './admin-shows.sass'
})
export class AdminShows implements OnInit {
  cities = signal<City[]>([]);
  movies = signal<Movie[]>([]);
  venues = signal<Venue[]>([]);     // venues of the selected city only
  screens = signal<Screen[]>([]);   // screens of the selected venue only
  shows = signal<Show[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  /** Filter for the table at the bottom (0 = all cities) */
  tableCityId = signal<number>(0);

  form = {
    cityId: 0,
    venueId: 0,
    screenId: 0,
    movieId: 0,
    date: '',
    time: '',
    durationMinutes: 120,
    basePrice: 200
  };

  visibleShows = computed(() => {
    const cityId = this.tableCityId();
    if (!cityId) return this.shows();
    return this.shows().filter(s => s.screen?.venue?.cityId === cityId);
  });

  constructor(
    private cityService: CityService,
    private movieService: MovieService,
    private venueService: VenueService,
    private screenService: ScreenService,
    private showService: ShowService
  ) {}

  ngOnInit(): void {
    this.movieService.getAll().subscribe(movies => {
      this.movies.set(movies);
      if (movies.length) this.form.movieId = movies[0].id;
    });

    this.cityService.getAll().subscribe(cities => {
      this.cities.set(cities);
      if (cities.length) {
        this.form.cityId = cities[0].id;
        this.onCityChange();
      }
      this.loading.set(false);
    });

    this.loadShows();
  }

  loadShows(): void {
    this.showService.getAll().subscribe({
      next: (shows) => this.shows.set(shows),
      error: () => this.error.set('Failed to load shows.')
    });
  }

  /** City changed → load only that city's venues */
  onCityChange(): void {
    this.venues.set([]);
    this.screens.set([]);
    this.form.venueId = 0;
    this.form.screenId = 0;

    this.venueService.getAll(this.form.cityId).subscribe(venues => {
      this.venues.set(venues);
      if (venues.length) {
        this.form.venueId = venues[0].id;
        this.onVenueChange();
      }
    });
  }

  /** Venue changed → load only that venue's screens */
  onVenueChange(): void {
    this.screens.set([]);
    this.form.screenId = 0;
    if (!this.form.venueId) return;

    this.screenService.getAll(this.form.venueId).subscribe(screens => {
      this.screens.set(screens);
      this.form.screenId = screens[0]?.id ?? 0;
    });
  }

  /** Movie changed → default duration to the movie's runtime */
  onMovieChange(): void {
    const movie = this.movies().find(m => m.id === this.form.movieId);
    if (movie?.durationMinutes) this.form.durationMinutes = movie.durationMinutes;
  }

  addShow(): void {
    this.error.set(null);
    this.success.set(null);

    if (!this.form.cityId)   { this.error.set('Pick a city.'); return; }
    if (!this.form.venueId)  { this.error.set('This city has no venues. Add one in Venues first.'); return; }
    if (!this.form.screenId) { this.error.set('This venue has no screens. Add one in Venues first.'); return; }
    if (!this.form.movieId)  { this.error.set('Pick a movie.'); return; }
    if (!this.form.date || !this.form.time) { this.error.set('Pick a date and time.'); return; }

    const start = new Date(`${this.form.date}T${this.form.time}`);
    if (start.getTime() < Date.now()) { this.error.set('Show time is in the past — users only see upcoming shows.'); return; }
    const end = new Date(start.getTime() + this.form.durationMinutes * 60000);

    this.showService.create({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      basePrice: Number(this.form.basePrice),
      movieId: Number(this.form.movieId),
      screenId: Number(this.form.screenId)
    }).subscribe({
      next: () => {
        this.success.set(
          `Added "${this.movieTitle(this.form.movieId)}" at ${this.venueName(this.form.venueId)} · ` +
          `${this.screenName(this.form.screenId)} (${this.cityName(this.form.cityId)}).`
        );
        this.loadShows();
      },
      error: () => this.error.set('Failed to create show. Make sure the screen has seats set up first.')
    });
  }

  movieTitle(movieId: number): string {
    return this.movies().find(m => m.id === movieId)?.title ?? '—';
  }
  cityName(cityId: number | undefined): string {
    return this.cities().find(c => c.id === cityId)?.name ?? '—';
  }
  venueName(venueId: number): string {
    return this.venues().find(v => v.id === venueId)?.name ?? '—';
  }
  screenName(screenId: number): string {
    return this.screens().find(s => s.id === screenId)?.name ?? '—';
  }
}