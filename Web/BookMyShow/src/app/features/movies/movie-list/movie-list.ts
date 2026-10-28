import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { MovieService } from '../../../core/services/movie';
import { SelectedCityService } from '../../../core/services/selected-city';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.sass'
})
export class MovieList {
  private movieService = inject(MovieService);
  readonly selectedCity = inject(SelectedCityService);

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    // Runs on page load AND every time the city changes in the navbar
    toObservable(this.selectedCity.city).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(city => {
        if (!city) return of<Movie[]>([]);
        return this.movieService.getAll(city.id).pipe(
          catchError(() => {
            this.error.set('Could not load movies. Is the API running?');
            return of<Movie[]>([]);
          })
        );
      }),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(movies => {
      this.movies.set(movies);
      this.loading.set(false);
    });
  }
}