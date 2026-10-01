using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeatsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public SeatsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Seat>>> GetAll([FromQuery] int screenId)
        => Ok(await _db.Seats.Where(s => s.ScreenId == screenId)
                              .OrderBy(s => s.Row).ThenBy(s => s.Number)
                              .ToListAsync());

    [HttpPost("bulk")]
    public async Task<ActionResult> CreateBulk(List<Seat> seats)
    {
        _db.Seats.AddRange(seats);
        await _db.SaveChangesAsync();
        return Ok(seats);
    }
}