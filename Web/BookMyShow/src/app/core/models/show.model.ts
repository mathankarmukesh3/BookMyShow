import { Movie } from './movie.model';
import { Screen } from './venue.model';

export enum ShowSeatStatus {
  Available = 0,
  Locked = 1,
  Booked = 2
}

export interface Show {
  id: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  movieId: number;
  movie?: Movie;
  screenId: number;
  screen?: Screen;
  showSeats?: ShowSeat[];
}

export interface ShowSeat {
  id: number;
  showId: number;
  seatId: number;
  seat?: import('./venue.model').Seat;
  status: ShowSeatStatus;
  price: number;
}