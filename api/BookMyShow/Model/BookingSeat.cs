namespace BookMyShow.Model;

public class BookingSeat
{
    public int Id { get; set; }

    public int BookingId { get; set; }
    public Booking? Booking { get; set; }

    public int ShowSeatId { get; set; }
    public ShowSeat? ShowSeat { get; set; }
    public decimal Price { get; set; }
}