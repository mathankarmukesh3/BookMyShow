import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking';
import { AuthService } from '../../../core/services/auth';
import { Booking, BookingStatus } from '../../../core/models/booking.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.sass'
})
export class MyBookings implements OnInit {
  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  readonly BookingStatus = BookingStatus;

  constructor(
    private bookingService: BookingService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.error.set('Please log in to see your bookings.');
      this.loading.set(false);
      return;
    }

    this.bookingService.getMyBookings(user.id).subscribe({
      next: (bookings) => { this.bookings.set(bookings); this.loading.set(false); },
      error: () => { this.error.set('Could not load your bookings.'); this.loading.set(false); }
    });
  }

  statusLabel(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PendingPayment: return 'Pending payment';
      case BookingStatus.Confirmed: return 'Confirmed';
      case BookingStatus.Cancelled: return 'Cancelled';
      case BookingStatus.Expired: return 'Expired';
      default: return 'Unknown';
    }
  }
}