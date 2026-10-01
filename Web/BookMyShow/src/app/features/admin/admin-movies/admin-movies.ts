import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../core/services/movie';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-admin-movies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-movies.html',
  styleUrl: './admin-movies.sass'
})
export class AdminMovies implements OnInit {
  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // form state — null means "adding new", otherwise editing this movie's id
  editingId = signal<number | null>(null);
  form = {
    title: '',
    description: '',
    durationMinutes: 0,
    language: '',
    genre: '',
    releaseDate: '',
    posterUrl: ''
  };

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.movieService.getAll().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load movies.');
        this.loading.set(false);
      }
    });
  }

  startAdd(): void {
    this.editingId.set(null);
    this.form = { title: '', description: '', durationMinutes: 0, language: '', genre: '', releaseDate: '', posterUrl: '' };
  }

  startEdit(movie: Movie): void {
    this.editingId.set(movie.id);
    this.form = {
      title: movie.title,
      description: movie.description ?? '',
      durationMinutes: movie.durationMinutes,
      language: movie.language,
      genre: movie.genre,
      releaseDate: movie.releaseDate.substring(0, 10),
      posterUrl: movie.posterUrl ?? ''
    };
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  save(): void {
    const id = this.editingId();

    if (id === null) {
      this.movieService.create(this.form).subscribe({
        next: () => { this.load(); this.startAdd(); },
        error: () => this.error.set('Failed to create movie.')
      });
    } else {
      this.movieService.update({ id, ...this.form }).subscribe({
        next: () => { this.load(); this.cancelEdit(); },
        error: () => this.error.set('Failed to update movie.')
      });
    }
  }

  remove(movie: Movie): void {
    if (!confirm(`Delete "${movie.title}"? This cannot be undone.`)) return;

    this.movieService.delete(movie.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Failed to delete movie.')
    });
  }
}