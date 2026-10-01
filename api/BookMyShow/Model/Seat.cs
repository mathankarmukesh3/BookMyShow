using BookMyShow.Model;

namespace BookMyShow.Model;

public class Seat
{
    public int Id { get; set; }
    public string Row { get; set; } = default!;   // "A", "B", ...
    public int Number { get; set; }                // 1, 2, 3 ...
    public SeatType SeatType { get; set; } = SeatType.Regular;

    public int ScreenId { get; set; }
    public Screen? Screen { get; set; }
}