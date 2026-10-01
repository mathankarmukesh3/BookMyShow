export interface City {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  cityId: number;
  city?: City;
}

export interface Screen {
  id: number;
  name: string;
  venueId: number;
  venue?: Venue;
}

export enum SeatType {
  Regular = 0,
  Premium = 1,
  Recliner = 2
}

export interface Seat {
  id: number;
  row: string;
  number: number;
  seatType: SeatType;
  screenId: number;
}