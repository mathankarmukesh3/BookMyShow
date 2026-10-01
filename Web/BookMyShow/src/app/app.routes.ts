import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { MovieList } from './features/movies/movie-list/movie-list';
import { MovieDetail } from './features/movies/movie-detail/movie-detail';
import { AdminLayout } from './features/admin/admin-layout/admin-layout';
import { AdminMovies } from './features/admin/admin-movies/admin-movies';
import { adminGuard } from './core/guards/admin-guard';
import { AdminVenues } from './features/admin/admin-venues/admin-venues';
import { AdminShows } from './features/admin/admin-shows/admin-shows';
import { ShowTimes } from './features/shows/show-times/show-times';
import { SeatSelection } from './features/seat-selection/seat-selection/seat-selection';
import { Payment } from './features/booking/payment/payment';
import { Confirmation } from './features/booking/confirmation/confirmation';
import { MyBookings } from './features/booking/my-bookings/my-bookings';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'movies', component: MovieList },
  { path: 'movies/:id', component: MovieDetail },
  { path: 'movies/:id/shows', component: ShowTimes },
  { path: 'shows/:id/seats', component: SeatSelection },
  { path: 'bookings/:id/pay', component: Payment },
  { path: 'bookings/:id/confirmation', component: Confirmation },
  { path: 'my-bookings', component: MyBookings },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: 'movies', component: AdminMovies },
      { path: 'venues', component: AdminVenues },
      { path: 'shows', component: AdminShows },
      { path: '', redirectTo: 'movies', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'movies', pathMatch: 'full' }
];