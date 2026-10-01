using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VenuesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public VenuesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Venue>>> GetAll([FromQuery] int? cityId)
    {
        var query = _db.Venues.Include(v => v.City).AsQueryable();
        if (cityId.HasValue) query = query.Where(v => v.CityId == cityId.Value);
        return Ok(await query.ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Venue>> GetById(int id)
    {
        var venue = await _db.Venues.Include(v => v.Screens).FirstOrDefaultAsync(v => v.Id == id);
        return venue is null ? NotFound() : Ok(venue);
    }

    [HttpPost]
    public async Task<ActionResult<Venue>> Create(Venue venue)
    {
        _db.Venues.Add(venue);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = venue.Id }, venue);
    }
}