import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShowService } from '../../../core/services/show';
import { MovieService } from '../../../core/services/movie';
import { Show } from '../../../core/models/show.model';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-show-times',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './show-times.html',
  styleUrl: './show-times.sass'
})
export class ShowTimes implements OnInit {
  movie = signal<Movie | null>(null);
  shows = signal<Show[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private showService: ShowService,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));
    if (!movieId) {
      this.error.set('Invalid movie.');
      this.loading.set(false);
      return;
    }

    this.movieService.getById(movieId).subscribe(m => this.movie.set(m));

    this.showService.getAll(movieId).subscribe({
      next: (shows) => { this.shows.set(shows); this.loading.set(false); },
      error: () => { this.error.set('Could not load showtimes.'); this.loading.set(false); }
    });
  }

  venueName(show: Show): string {
    return show.screen?.venue?.name ?? 'Venue';
  }

  screenName(show: Show): string {
    return show.screen?.name ?? 'Screen';
  }
}