namespace BookMyShow.Model;

public class Venue
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Address { get; set; } = default!;

    public int CityId { get; set; }
    public City? City { get; set; }

    public ICollection<Screen> Screens { get; set; } = new List<Screen>();
}