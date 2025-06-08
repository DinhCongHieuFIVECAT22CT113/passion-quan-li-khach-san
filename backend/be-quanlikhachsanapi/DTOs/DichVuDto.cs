using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class DichVuDTO
    {
        public string MaDichVu { get; set; } = default!;

        public string TenDichVu { get; set; } = default!;
        public string? Thumbnail { get; set; }
        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }
        public DateTime? NgayTao { get; set; }
        public DateTime? NgaySua { get; set; }

    }
    public class CreateDichVuDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenDichVu { get; set; } = default!;
        
        // For file upload
        public IFormFile? ThumbnailFile { get; set; }
        
        // For URL (when file is uploaded)
        [MaxLength(500)]
        public string? Thumbnail { get; set; }

        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }

    }
    public class UpdateDichVuDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenDichVu { get; set; } = default!;
        
        // For file upload
        public IFormFile? ThumbnailFile { get; set; }
        
        // For URL (when file is uploaded or keeping existing)
        [MaxLength(500)]
        public string? Thumbnail { get; set; }

        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }

    }
}
