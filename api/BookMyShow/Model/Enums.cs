namespace BookMyShow.Model;
public enum SeatType
{
    Regular = 0,
    Premium = 1,
    Recliner = 2
}

public enum ShowSeatStatus
{
    Available = 0,
    Locked = 1,
    Booked = 2
}

public enum BookingStatus
{
    PendingPayment = 0,
    Confirmed = 1,
    Cancelled = 2,
    Expired = 3
}

public enum PaymentStatus
{
    Initiated = 0,
    Success = 1,
    Failed = 2,
    Refunded = 3
}

public enum UserRole
{
    Customer = 0,
    Admin = 1,
    VenueManager = 2
}