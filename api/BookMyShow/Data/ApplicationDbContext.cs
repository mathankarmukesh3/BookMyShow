using BookMyShow.Model;
using Microsoft.EntityFrameworkCore;

namespace BookMyShow.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Screen> Screens => Set<Screen>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Show> Shows => Set<Show>();
    public DbSet<ShowSeat> ShowSeats => Set<ShowSeat>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingSeat> BookingSeats => Set<BookingSeat>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---------- User ----------
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.Name).HasMaxLength(200).IsRequired();
        });

        // ---------- City / Venue / Screen / Seat ----------
        modelBuilder.Entity<City>(e =>
        {
            e.HasIndex(c => c.Name).IsUnique();
        });

        modelBuilder.Entity<Venue>(e =>
        {
            e.HasOne(v => v.City)
                .WithMany(c => c.Venues)
                .HasForeignKey(v => v.CityId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Screen>(e =>
        {
            e.HasOne(s => s.Venue)
                .WithMany(v => v.Screens)
                .HasForeignKey(s => s.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Seat>(e =>
        {
            e.HasOne(s => s.Screen)
                .WithMany(sc => sc.Seats)
                .HasForeignKey(s => s.ScreenId)
                .OnDelete(DeleteBehavior.Cascade);

            // No two seats in the same screen share a row+number
            e.HasIndex(s => new { s.ScreenId, s.Row, s.Number }).IsUnique();
        });

        // ---------- Movie / Show ----------
        modelBuilder.Entity<Movie>(e =>
        {
            e.Property(m => m.Title).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<Show>(e =>
        {
            e.HasOne(s => s.Movie)
                .WithMany(m => m.Shows)
                .HasForeignKey(s => s.MovieId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.Screen)
                .WithMany(sc => sc.Shows)
                .HasForeignKey(s => s.ScreenId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(s => s.BasePrice).HasColumnType("decimal(10,2)");

            e.HasIndex(s => new { s.ScreenId, s.StartTime });
        });

        // ---------- ShowSeat (hot path for concurrency) ----------
        modelBuilder.Entity<ShowSeat>(e =>
        {
            e.HasOne(ss => ss.Show)
                .WithMany(s => s.ShowSeats)
                .HasForeignKey(ss => ss.ShowId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ss => ss.Seat)
                .WithMany()
                .HasForeignKey(ss => ss.SeatId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(ss => new { ss.ShowId, ss.SeatId }).IsUnique();
            e.Property(ss => ss.Price).HasColumnType("decimal(10,2)");

            // Postgres's xmin system column used as an optimistic concurrency
            // token — EF Core includes "WHERE xmin = @p" on updates and
            // throws DbUpdateConcurrencyException if another request won the race.
            e.Property(ss => ss.Version)
                .IsRowVersion()
                .HasColumnName("xmin")
                .ValueGeneratedOnAddOrUpdate();
        });

        // ---------- Booking / BookingSeat / Payment ----------
        modelBuilder.Entity<Booking>(e =>
        {
            e.HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(b => b.TotalAmount).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<BookingSeat>(e =>
        {
            e.HasOne(bs => bs.Booking)
                .WithMany(b => b.BookingSeats)
                .HasForeignKey(bs => bs.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(bs => bs.ShowSeat)
                .WithMany()
                .HasForeignKey(bs => bs.ShowSeatId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(bs => bs.Price).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.HasOne(p => p.Booking)
                .WithOne(b => b.Payment)
                .HasForeignKey<Payment>(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(p => p.Amount).HasColumnType("decimal(10,2)");
        });
    }
}