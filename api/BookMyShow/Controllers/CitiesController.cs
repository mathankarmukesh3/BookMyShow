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
}