using BookMyShow.Model;

namespace BookMyShow.Model;

/// <summary>
/// One row per seat, per show. This is the table that concurrent bookings
/// contend on — status transitions (Available -> Locked -> Booked) must be
/// done with a WHERE-guarded update to avoid double-booking.
/// </summary>
public class ShowSeat
{
    public int Id { get; set; }

    public int ShowId { get; set; }
    public Show? Show { get; set; }

    public int SeatId { get; set; }
    public Seat? Seat { get; set; }

    public ShowSeatStatus Status { get; set; } = ShowSeatStatus.Available;
    public decimal Price { get; set; } // can override Show.BasePrice per seat type

    public Guid? LockedByUserId { get; set; }
    public DateTime? LockedAt { get; set; }

    // Postgres xmin will back this — used for optimistic concurrency
    // so two requests can't lock the same seat at once.
    public uint Version { get; set; }
}