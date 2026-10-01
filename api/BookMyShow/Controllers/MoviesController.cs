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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Movie>>> GetAll()
        => Ok(await _db.Movies.OrderByDescending(m => m.ReleaseDate).ToListAsync());

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
        if (movie is null) return NotFound();
        _db.Movies.Remove(movie);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}