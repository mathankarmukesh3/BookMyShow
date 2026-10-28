import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Show } from '../models/show.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShowService {
  private readonly apiUrl = `${environment.apiUrl}/shows`;

  constructor(private http: HttpClient) {}

  getAll(movieId?: number, cityId?: number, upcomingOnly = false): Observable<Show[]> {
    let params = new HttpParams();
    if (movieId) params = params.set('movieId', movieId);
    if (cityId) params = params.set('cityId', cityId);
    if (upcomingOnly) params = params.set('upcomingOnly', true);
    return this.http.get<Show[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Show> {
    return this.http.get<Show>(`${this.apiUrl}/${id}`);
  }

  create(show: Omit<Show, 'id' | 'movie' | 'screen' | 'showSeats'>): Observable<Show> {
    return this.http.post<Show>(this.apiUrl, show);
  }
}