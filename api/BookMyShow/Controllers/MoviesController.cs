using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public MoviesController(ApplicationDbContext db) => _db = db;

    // GET api/movies            -> all movies (admin)
    // GET api/movies?cityId=2   -> only movies with upcoming shows in that city (users)
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? cityId)
    {
        var query = _db.Movies.AsQueryable();

        if (cityId.HasValue)
        {
            var now = DateTime.UtcNow;
            query = query.Where(m => m.Shows.Any(s =>
                s.StartTime >= now && s.Screen!.Venue!.CityId == cityId.Value));
        }

        var movies = await query
            .OrderByDescending(m => m.ReleaseDate)
            .ToListAsync();

        return Ok(movies);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Movie>> GetById(int id)
    {
        var movie = await _db.Movies.FindAsync(id);
        return movie is null ? NotFound() : Ok(movie);
    }

    [HttpPost]
    public async Task<ActionResult<Movie>> Create(Movie movie)
    {
        _db.Movies.Add(movie);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Movie updated)
    {
        if (id != updated.Id) return BadRequest();
        _db.Entry(updated).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var movie = await _db.Movies.FindAsync(id);
        if (movie is null)
            return NotFound(new { message = "Movie not found." });

        var shows = await _db.Shows.Where(s => s.MovieId == id).ToListAsync();
        _db.Shows.RemoveRange(shows);
        _db.Movies.Remove(movie);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Movie and its associated shows deleted successfully." });
    }
}