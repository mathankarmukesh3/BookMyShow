import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../../core/services/movie';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.sass'
})
export class MovieDetail implements OnInit {
  movie = signal<Movie | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('Invalid movie id.');
      this.loading.set(false);
      return;
    }

    this.movieService.getById(id).subscribe({
      next: (movie) => {
        this.movie.set(movie);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Movie not found.');
        this.loading.set(false);
      }
    });
  }
}