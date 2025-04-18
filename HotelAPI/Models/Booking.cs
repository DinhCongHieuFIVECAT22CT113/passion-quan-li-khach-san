using System.ComponentModel.DataAnnotations;

namespace HotelAPI.Models
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int RoomId { get; set; }
        public Room Room { get; set; }
        
        [Required]
        public int CustomerId { get; set; }
        public Customer Customer { get; set; }
        
        [Required]
        public DateTime CheckInDate { get; set; }
        
        [Required]
        public DateTime CheckOutDate { get; set; }
        
        [Required]
        public decimal TotalPrice { get; set; }
        
        [Required]
        public string Status { get; set; } // Pending, Confirmed, Cancelled, Completed
        
        public string SpecialRequests { get; set; }
    }
} 