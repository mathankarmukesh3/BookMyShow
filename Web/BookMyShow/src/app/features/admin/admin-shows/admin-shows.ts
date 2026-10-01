import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../core/services/movie';
import { ScreenService } from '../../../core/services/screen';
import { VenueService } from '../../../core/services/venue';
import { ShowService } from '../../../core/services/show';
import { Movie } from '../../../core/models/movie.model';
import { Screen, Venue } from '../../../core/models/venue.model';
import { Show } from '../../../core/models/show.model';

@Component({
  selector: 'app-admin-shows',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-shows.html',
  styleUrl: './admin-shows.sass'
})
export class AdminShows implements OnInit {
  movies = signal<Movie[]>([]);
  venues = signal<Venue[]>([]);
  screens = signal<Screen[]>([]);
  shows = signal<Show[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  form = {
    movieId: 0,
    venueId: 0,
    screenId: 0,
    date: '',
    time: '',
    durationMinutes: 120,
    basePrice: 200
  };

  constructor(
    private movieService: MovieService,
    private venueService: VenueService,
    private screenService: ScreenService,
    private showService: ShowService
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.movieService.getAll().subscribe(movies => {
      this.movies.set(movies);
      if (movies.length) this.form.movieId = movies[0].id;
    });
    this.venueService.getAll().subscribe(venues => {
      this.venues.set(venues);
      if (venues.length) {
        this.form.venueId = venues[0].id;
        this.onVenueChange();
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

  onVenueChange(): void {
    this.screenService.getAll(this.form.venueId).subscribe(screens => {
      this.screens.set(screens);
      this.form.screenId = screens[0]?.id ?? 0;
    });
  }

  addShow(): void {
    if (!this.form.movieId || !this.form.screenId || !this.form.date || !this.form.time) return;

    const start = new Date(`${this.form.date}T${this.form.time}`);
    const end = new Date(start.getTime() + this.form.durationMinutes * 60000);

    this.showService.create({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      basePrice: this.form.basePrice,
      movieId: this.form.movieId,
      screenId: this.form.screenId
    }).subscribe({
      next: () => { this.loadShows(); alert('Show created.'); },
      error: () => this.error.set('Failed to create show. Make sure the screen has seats set up first.')
    });
  }

  movieTitle(movieId: number): string {
    return this.movies().find(m => m.id === movieId)?.title ?? '—';
  }
}