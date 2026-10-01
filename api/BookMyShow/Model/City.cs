using System;
namespace BookMyShow.Model;
public class City
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;

    public ICollection<Venue> Venues { get; set; } = new List<Venue>();
}