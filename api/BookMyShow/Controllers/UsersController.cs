using BookMyShow.Data;
using BookMyShow.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BookMyShow.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public UsersController(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }


    // ---------- LOGIN ----------
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null)
        {
            return Unauthorized("Invalid email or password.");
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordValid)
        {
            return Unauthorized("Invalid email or password.");
        }

        string token = GenerateJwtToken(user);
        var response = new LoginResponse(token, ToResponse(user));

        return Ok(response);
    }

    // Pulled token creation into its own method so Login() stays readable
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("Jwt");

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var keyBytes = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);
        var signingKey = new SymmetricSecurityKey(keyBytes);
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        double expiryMinutes = double.Parse(jwtSettings["ExpiryMinutes"]!);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserResponse ToResponse(User u)
    {
        return new UserResponse(u.Id, u.Name, u.Email, u.Role, u.CreatedAt);
    }

    // ---------- GET ALL ----------
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
        var users = await _db.Users.ToListAsync();

        var result = new List<UserResponse>();
        foreach (var user in users)
        {
            result.Add(ToResponse(user));
        }

        return Ok(result);
    }

    // ---------- GET BY ID ----------
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResponse>> GetById(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound($"User with id '{id}' was not found.");
        }

        return Ok(ToResponse(user));
    }

    // ---------- CREATE ----------
    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Name, email, and password are all required.");
        }

        bool emailTaken = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (emailTaken)
        {
            return Conflict("A user with this email already exists.");
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Customer
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, ToResponse(user));
    }

    // ---------- DELETE ----------
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound($"User with id '{id}' was not found.");
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    public record LoginRequest(string Email, string Password);
    public record LoginResponse(string Token, UserResponse User);
    public record CreateUserRequest(string Name, string Email, string Password);
    public record UserResponse(Guid Id, string Name, string Email, UserRole Role, DateTime CreatedAt);

}