export enum BookingStatus {
  PendingPayment = 0,
  Confirmed = 1,
  Cancelled = 2,
  Expired = 3
}

export enum PaymentStatus {
  Initiated = 0,
  Success = 1,
  Failed = 2,
  Refunded = 3
}

export interface Booking {
  id: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  userId: string;
  showId: number;
  bookingSeats?: BookingSeat[];
  payment?: Payment;
}

export interface BookingSeat {
  id: number;
  bookingId: number;
  showSeatId: number;
  price: number;
}

export interface Payment {
  id: number;
  bookingId: number;
  providerReference: string;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
}