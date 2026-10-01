namespace BookMyShow.Model;
public class Show
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal BasePrice { get; set; }

    public int MovieId { get; set; }
    public Movie? Movie { get; set; }

    public int ScreenId { get; set; }
    public Screen? Screen { get; set; }

    public ICollection<ShowSeat> ShowSeats { get; set; } = new List<ShowSeat>();
}