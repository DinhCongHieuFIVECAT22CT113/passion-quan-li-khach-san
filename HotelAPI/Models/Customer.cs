using System.ComponentModel.DataAnnotations;

namespace HotelAPI.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FullName { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
        
        public string Address { get; set; }
        
        public string IdentityNumber { get; set; }
        
        public List<Booking> Bookings { get; set; }
    }
} 