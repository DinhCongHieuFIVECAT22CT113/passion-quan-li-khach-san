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

    }
    public class CreateDichVuDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenDichVu { get; set; } = default!;
        [Required(ErrorMessage = "Hình ảnh là bắt buộc.")]
        [MaxLength(500)]
        public string? Thumbnail { get; set; }

        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }
        [Required(ErrorMessage = "Ngày tạo dịch vụ là bắt buộc.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? NgayTao { get; set; }
        [Required(ErrorMessage = "Ngày sửa dịch vụ là bắt buộc.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? NgaySua { get; set; }
    }
    public class UpdateDichVuDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenDichVu { get; set; } = default!;
        [Required(ErrorMessage = "Hình ảnh là bắt buộc.")]
        [MaxLength(500)]
        public string? Thumbnail { get; set; }

        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }
        [Required(ErrorMessage = "Ngày sửa phòng là bắt buộc.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? NgaySua { get; set; }
    }
}
