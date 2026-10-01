using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShowsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ShowsController(ApplicationDbContext db) => _db = db;

    // GET api/shows?movieId=1
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Show>>> GetAll([FromQuery] int? movieId)
    {
        var query = _db.Shows
            .Include(s => s.Screen).ThenInclude(sc => sc.Venue)
            .AsQueryable();

        if (movieId.HasValue) query = query.Where(s => s.MovieId == movieId.Value);

        return Ok(await query.OrderBy(s => s.StartTime).ToListAsync());
    }

    // GET api/shows/5 — includes the seat map with live status
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Show>> GetById(int id)
    {
        var show = await _db.Shows
            .Include(s => s.Screen).ThenInclude(sc => sc.Venue)
            .Include(s => s.ShowSeats).ThenInclude(ss => ss.Seat)
            .FirstOrDefaultAsync(s => s.Id == id);

        return show is null ? NotFound() : Ok(show);
    }

    [HttpPost]
    public async Task<ActionResult<Show>> Create(Show show)
    {
        _db.Shows.Add(show);
        await _db.SaveChangesAsync();

        // Auto-generate a ShowSeat row for every seat on this screen
        var seats = await _db.Seats.Where(s => s.ScreenId == show.ScreenId).ToListAsync();
        var showSeats = seats.Select(seat => new ShowSeat
        {
            ShowId = show.Id,
            SeatId = seat.Id,
            Price = show.BasePrice,
            Status = ShowSeatStatus.Available
        });
        _db.ShowSeats.AddRange(showSeats);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = show.Id }, show);
    }
}