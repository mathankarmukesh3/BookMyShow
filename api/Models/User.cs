using System.ComponentModel.DataAnnotations;

namespace api.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}
