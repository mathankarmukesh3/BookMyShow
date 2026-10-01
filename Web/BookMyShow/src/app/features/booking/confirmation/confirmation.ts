import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking';
import { Booking, BookingStatus } from '../../../core/models/booking.model';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.sass'
})
export class Confirmation implements OnInit {
  booking = signal<Booking | null>(null);
  loading = signal(true);
  readonly BookingStatus = BookingStatus;

  constructor(private route: ActivatedRoute, private bookingService: BookingService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.getById(id).subscribe({
      next: (b) => { this.booking.set(b); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}