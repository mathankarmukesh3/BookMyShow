using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScreensController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ScreensController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Screen>>> GetAll([FromQuery] int? venueId)
    {
        var query = _db.Screens.AsQueryable();
        if (venueId.HasValue) query = query.Where(s => s.VenueId == venueId.Value);
        return Ok(await query.ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<Screen>> Create(Screen screen)
    {
        _db.Screens.Add(screen);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = screen.Id }, screen);
    }
}