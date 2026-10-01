import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venue } from '../models/venue.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VenueService {
  private readonly apiUrl = `${environment.apiUrl}/venues`;

  constructor(private http: HttpClient) {}

  getAll(cityId?: number): Observable<Venue[]> {
    const url = cityId ? `${this.apiUrl}?cityId=${cityId}` : this.apiUrl;
    return this.http.get<Venue[]>(url);
  }

  create(venue: Omit<Venue, 'id' | 'city'>): Observable<Venue> {
    return this.http.post<Venue>(this.apiUrl, venue);
  }
}