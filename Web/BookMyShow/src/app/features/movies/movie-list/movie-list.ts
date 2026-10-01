import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../../core/services/movie';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.sass'
})
export class MovieList implements OnInit {
  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getAll().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load movies. Is the API running?');
        this.loading.set(false);
      }
    });
  }
}