import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  create(showId: number, showSeatIds: number[]): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, { showId, showSeatIds });
  }

  getById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  pay(id: number, success: boolean): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/${id}/pay`, { success });
  }

  getMyBookings(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }
}