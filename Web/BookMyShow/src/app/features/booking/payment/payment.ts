import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.html',
  styleUrl: './payment.sass'
})
export class Payment implements OnInit {
  booking = signal<Booking | null>(null);
  loading = signal(true);
  processing = signal(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.getById(id).subscribe({
      next: (b) => { this.booking.set(b); this.loading.set(false); },
      error: () => { this.error.set('Booking not found.'); this.loading.set(false); }
    });
  }

  pay(success: boolean): void {
    const id = this.booking()?.id;
    if (!id) return;

    this.processing.set(true);
    this.bookingService.pay(id, success).subscribe({
      next: () => {
        this.processing.set(false);
        this.router.navigate(['/bookings', id, 'confirmation']);
      },
      error: () => {
        this.processing.set(false);
        this.error.set('Payment processing failed.');
      }
    });
  }
}