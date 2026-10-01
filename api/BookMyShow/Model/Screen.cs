namespace BookMyShow.Model;

public class Screen
{
    public int Id { get; set; }
    public string Name { get; set; } = default!; // e.g. "Screen 1", "Audi 3 - IMAX"

    public int VenueId { get; set; }
    public Venue? Venue { get; set; }

    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Show> Shows { get; set; } = new List<Show>();
}