import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly apiUrl = `${environment.apiUrl}/movies`;

  constructor(private http: HttpClient) {}

  /** No cityId = all movies (admin). With cityId = only movies showing in that city. */
  getAll(cityId?: number): Observable<Movie[]> {
    const url = cityId ? `${this.apiUrl}?cityId=${cityId}` : this.apiUrl;
    return this.http.get<Movie[]>(url);
  }

  getById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/${id}`);
  }

  create(movie: Omit<Movie, 'id'>): Observable<Movie> {
    return this.http.post<Movie>(this.apiUrl, movie);
  }

  update(movie: Movie): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${movie.id}`, movie);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}