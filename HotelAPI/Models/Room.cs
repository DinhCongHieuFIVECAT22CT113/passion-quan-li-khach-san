using System.ComponentModel.DataAnnotations;

namespace HotelAPI.Models
{
    public class Room
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string RoomNumber { get; set; }
        
        [Required]
        public string RoomType { get; set; }
        
        [Required]
        public decimal PricePerNight { get; set; }
        
        [Required]
        public int Capacity { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public bool IsAvailable { get; set; }
        
        public List<Booking> Bookings { get; set; }
    }
} 