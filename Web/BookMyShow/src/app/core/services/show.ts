import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Show } from '../models/show.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShowService {
  private readonly apiUrl = `${environment.apiUrl}/shows`;

  constructor(private http: HttpClient) {}

  getAll(movieId?: number): Observable<Show[]> {
    const url = movieId ? `${this.apiUrl}?movieId=${movieId}` : this.apiUrl;
    return this.http.get<Show[]>(url);
  }

  getById(id: number): Observable<Show> {
    return this.http.get<Show>(`${this.apiUrl}/${id}`);
  }

  create(show: Omit<Show, 'id' | 'movie' | 'screen' | 'showSeats'>): Observable<Show> {
    return this.http.post<Show>(this.apiUrl, show);
  }
}