import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seat } from '../models/venue.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private readonly apiUrl = `${environment.apiUrl}/seats`;

  constructor(private http: HttpClient) {}

  getAll(screenId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}?screenId=${screenId}`);
  }

  createBulk(seats: Omit<Seat, 'id'>[]): Observable<Seat[]> {
    return this.http.post<Seat[]>(`${this.apiUrl}/bulk`, seats);
  }
}