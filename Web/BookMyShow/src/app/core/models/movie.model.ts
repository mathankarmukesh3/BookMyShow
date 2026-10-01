export interface Movie {
  id: number;
  title: string;
  description?: string;
  durationMinutes: number;
  language: string;
  genre: string;
  releaseDate: string; // ISO date string
  posterUrl?: string;
}