import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { City } from '../models/venue.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly apiUrl = `${environment.apiUrl}/cities`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }

  create(city: Omit<City, 'id'>): Observable<City> {
    return this.http.post<City>(this.apiUrl, city);
  }
}