using System.Security.Claims;
using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public BookingsController(ApplicationDbContext db) => _db = db;

    public record CreateBookingRequest(int ShowId, List<int> ShowSeatIds);
    public record PayRequest(bool Success);

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // POST api/bookings — locks the requested seats and creates a pending booking
    [HttpPost]
    public async Task<ActionResult<Booking>> Create(CreateBookingRequest request)
    {
        if (request.ShowSeatIds is null || request.ShowSeatIds.Count == 0)
            return BadRequest("No seats selected.");

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var showSeats = await _db.ShowSeats
            .Where(ss => request.ShowSeatIds.Contains(ss.Id) && ss.ShowId == request.ShowId)
            .ToListAsync();

        if (showSeats.Count != request.ShowSeatIds.Count)
            return BadRequest("One or more seats not found for this show.");

        if (showSeats.Any(ss => ss.Status != ShowSeatStatus.Available))
            return Conflict("One or more selected seats are no longer available.");

        foreach (var seat in showSeats)
        {
            seat.Status = ShowSeatStatus.Locked;
            seat.LockedByUserId = CurrentUserId;
            seat.LockedAt = DateTime.UtcNow;
        }

        try
        {
            // xmin-backed optimistic concurrency: if another request modified
            // any of these rows since we read them, this throws.
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            return Conflict("One or more selected seats were just taken by someone else. Please pick again.");
        }

        var booking = new Booking
        {
            UserId = CurrentUserId,
            ShowId = request.ShowId,
            Status = BookingStatus.PendingPayment,
            TotalAmount = showSeats.Sum(ss => ss.Price),
            BookingSeats = showSeats.Select(ss => new BookingSeat
            {
                ShowSeatId = ss.Id,
                Price = ss.Price
            }).ToList()
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(booking);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Booking>> GetById(int id)
    {
        var booking = await _db.Bookings
            .Include(b => b.BookingSeats).ThenInclude(bs => bs.ShowSeat).ThenInclude(ss => ss!.Seat)
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null) return NotFound();
        if (booking.UserId != CurrentUserId) return Forbid();

        return Ok(booking);
    }

    // POST api/bookings/5/pay — mock payment: flips seats to Booked/Available and records the result
    [HttpPost("{id:int}/pay")]
    public async Task<ActionResult<Booking>> Pay(int id, PayRequest request)
    {
        var booking = await _db.Bookings
            .Include(b => b.BookingSeats).ThenInclude(bs => bs.ShowSeat)
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null) return NotFound();
        if (booking.UserId != CurrentUserId) return Forbid();
        if (booking.Status != BookingStatus.PendingPayment)
            return Conflict("This booking has already been processed.");

        foreach (var bookingSeat in booking.BookingSeats)
        {
            var showSeat = bookingSeat.ShowSeat!;
            if (request.Success)
            {
                showSeat.Status = ShowSeatStatus.Booked;
            }
            else
            {
                showSeat.Status = ShowSeatStatus.Available;
                showSeat.LockedByUserId = null;
                showSeat.LockedAt = null;
            }
        }

        booking.Status = request.Success ? BookingStatus.Confirmed : BookingStatus.Cancelled;

        _db.Payments.Add(new Payment
        {
            BookingId = booking.Id,
            ProviderReference = $"MOCK-{Guid.NewGuid():N}".Substring(0, 20),
            Status = request.Success ? PaymentStatus.Success : PaymentStatus.Failed,
            Amount = booking.TotalAmount
        });

        await _db.SaveChangesAsync();

        return Ok(booking);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<Booking>>> GetByUser(Guid userId)
    {
        if (userId != CurrentUserId) return Forbid();

        return Ok(await _db.Bookings
            .Include(b => b.Payment)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync());
    }
}