import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Show, ShowSeat, ShowSeatStatus } from '../../../core/models/show.model';
import { ShowService } from '../../../core/services/show';
import { BookingService } from '../../../core/services/booking';
import { Seat } from '../../../core/models/venue.model';

interface SeatRow {
  row: string;
  seats: ShowSeat[];
}

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './seat-selection.html',
  styleUrl: './seat-selection.sass'
})
export class SeatSelection implements OnInit {
  show = signal<Show | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedSeatIds = signal<Set<number>>(new Set());

  booking = signal(false);
  bookingError = signal<string | null>(null);

  rows = computed<SeatRow[]>(() => {
    const showSeats = this.show()?.showSeats ?? [];
    const byRow = new Map<string, ShowSeat[]>();

    for (const ss of showSeats) {
      const rowLabel = ss.seat?.row ?? '?';
      if (!byRow.has(rowLabel)) byRow.set(rowLabel, []);
      byRow.get(rowLabel)!.push(ss);
    }

    return Array.from(byRow.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, seats]) => ({
        row,
        seats: seats.sort((a, b) => (a.seat?.number ?? 0) - (b.seat?.number ?? 0))
      }));
  });

  selectedSeats = computed<ShowSeat[]>(() => {
    const ids = this.selectedSeatIds();
    return (this.show()?.showSeats ?? []).filter(ss => ids.has(ss.id));
  });

  totalPrice = computed(() =>
    this.selectedSeats().reduce((sum, ss) => sum + ss.price, 0)
  );

  readonly ShowSeatStatus = ShowSeatStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private showService: ShowService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const showId = Number(this.route.snapshot.paramMap.get('id'));
    if (!showId) {
      this.error.set('Invalid show.');
      this.loading.set(false);
      return;
    }

    this.showService.getById(showId).subscribe({
      next: (show) => { this.show.set(show); this.loading.set(false); },
      error: () => { this.error.set('Could not load seat map.'); this.loading.set(false); }
    });
  }

  seatLabel(seat?: Seat): string {
    return seat ? `${seat.row}${seat.number}` : '?';
  }

  toggleSeat(showSeat: ShowSeat): void {
    if (showSeat.status !== ShowSeatStatus.Available) return;

    const ids = new Set(this.selectedSeatIds());
    if (ids.has(showSeat.id)) {
      ids.delete(showSeat.id);
    } else {
      ids.add(showSeat.id);
    }
    this.selectedSeatIds.set(ids);
  }

  isSelected(showSeat: ShowSeat): boolean {
    return this.selectedSeatIds().has(showSeat.id);
  }

  proceedToPayment(): void {
    const showId = this.show()?.id;
    const seatIds = this.selectedSeats().map(ss => ss.id);
    if (!showId || seatIds.length === 0) return;

    this.booking.set(true);
    this.bookingError.set(null);

    this.bookingService.create(showId, seatIds).subscribe({
      next: (booking) => {
        this.booking.set(false);
        this.router.navigate(['/bookings', booking.id, 'pay']);
      },
      error: (err) => {
        this.booking.set(false);
        this.bookingError.set(
          err.status === 409 ? (err.error ?? 'Seats no longer available.') : 'Could not create booking.'
        );
      }
    });
  }
}