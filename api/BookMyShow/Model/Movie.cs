namespace BookMyShow.Model;
public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public string Language { get; set; } = default!;
    public string Genre { get; set; } = default!;
    public DateOnly ReleaseDate { get; set; }
    public string? PosterUrl { get; set; }

    public ICollection<Show> Shows { get; set; } = new List<Show>();
}