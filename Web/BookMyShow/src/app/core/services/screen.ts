import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Screen } from '../models/venue.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ScreenService {
  private readonly apiUrl = `${environment.apiUrl}/screens`;

  constructor(private http: HttpClient) {}

  getAll(venueId?: number): Observable<Screen[]> {
    const url = venueId ? `${this.apiUrl}?venueId=${venueId}` : this.apiUrl;
    return this.http.get<Screen[]>(url);
  }

  create(screen: Omit<Screen, 'id'>): Observable<Screen> {
    return this.http.post<Screen>(this.apiUrl, screen);
  }
}