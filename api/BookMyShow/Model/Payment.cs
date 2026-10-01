namespace BookMyShow.Model;

public class Payment
{
    public int Id { get; set; }

    public int BookingId { get; set; }
    public Booking? Booking { get; set; }

    public string ProviderReference { get; set; } = default!;
    public PaymentStatus Status { get; set; } = PaymentStatus.Initiated;
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}