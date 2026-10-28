using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitiesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public CitiesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<City>>> GetAll()
        => Ok(await _db.Cities.OrderBy(c => c.Name).ToListAsync());

    [HttpPost]
    public async Task<ActionResult<City>> Create(City city)
    {
        _db.Cities.Add(city);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = city.Id }, city);
    }

    // DELETE api/cities/5
    // Removes the city together with its venues, screens, seats and shows.
    // Refused (409) if any show in this city already has a booking.
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var city = await _db.Cities.FindAsync(id);
        if (city is null) return NotFound(new { message = "City not found." });

        var hasBookings = await _db.Bookings
            .AnyAsync(b => b.Show!.Screen!.Venue!.CityId == id);
        if (hasBookings)
            return Conflict(new { message = $"Cannot delete {city.Name}: some shows here already have bookings." });

        await using var tx = await _db.Database.BeginTransactionAsync();

        // 1. Shows first (Show -> Screen is Restrict). ShowSeats cascade with the show.
        var shows = await _db.Shows.Where(s => s.Screen!.Venue!.CityId == id).ToListAsync();
        _db.Shows.RemoveRange(shows);
        await _db.SaveChangesAsync();

        // 2. Venues (Screens and Seats cascade with the venue).
        var venues = await _db.Venues.Where(v => v.CityId == id).ToListAsync();
        _db.Venues.RemoveRange(venues);
        await _db.SaveChangesAsync();

        // 3. The city itself.
        _db.Cities.Remove(city);
        await _db.SaveChangesAsync();

        await tx.CommitAsync();
        return Ok(new { message = $"{city.Name} deleted (with {venues.Count} venue(s) and {shows.Count} show(s))." });
    }
}