using api.Data;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Xml.Linq;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest("Email and password are required.");
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return Unauthorized("Invalid email or password.");
                }

                if (user.Password != request.Password)
                {
                    return Unauthorized("Invalid email or password.");
                }

                var token = GenerateJwtToken(user);

                return Ok(new 
                { 
                    Message = "Login successful." ,
                    User = new { 
                        user.Name, 
                        user.Email }
                });
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.Name)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    Convert.ToDouble(_configuration["Jwt:ExpiryMinutes"])
                ),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }



        [HttpPost("register")]
        public async Task<IActionResult> Register( CreateUserRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest("Name, email, and password are required.");
                }

                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (existingUser != null)
                {
                    return Conflict("A user with this email already exists.");
                }

                var newUser = new Models.User
                {
                    Name = request.Name,
                    Email = request.Email,
                    Password = request.Password
                };
                
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
            return Ok(User);
        }

        [Authorize]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new UserResponse(u.Name, u.Email))
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while retrieving users.",
                    Error = ex.Message
                });
            }
        }


        [HttpPost("create-employee")]
        public async Task<IActionResult> CreateEmployee(CreateEmployeeRequest request)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.Name) ||
                    string.IsNullOrWhiteSpace(request.Position) ||
                    string.IsNullOrWhiteSpace(request.Department) ||
                    string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest("Name, position, department, and email are required.");
                }

                // Check if employee already exists
                var existingEmployee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == request.Email);

                if (existingEmployee != null)
                {
                    return Conflict(request.Email + " already exists.");
                }

                // Create new employee
                var newEmployee = new Employee
                {
                    Name = request.Name,
                    DOB = request.DOB,
                    Position = request.Position,
                    Department = request.Department,
                    Email = request.Email
                };

                // Add employee to database
                _context.Employees.Add(newEmployee);

                // Save changes
                await _context.SaveChangesAsync();

                // Return success response
                return Ok(new
                {
                    Message = "Employee created successfully.",
                    Employee = newEmployee
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while creating the employee.",
                    Error = ex.Message
                });
            }
        }


        public record CreateEmployeeRequest(string Name, DateOnly DOB, string Position, string Department, string Email);

        public record LoginRequest(string Email, string Password);

        public record CreateUserRequest(string Name, string Email, string Password);

        public record UserResponse(string Name, string Email);
    }
}
