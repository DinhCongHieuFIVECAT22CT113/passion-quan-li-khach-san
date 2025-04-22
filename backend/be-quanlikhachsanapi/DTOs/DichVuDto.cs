using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class DichVuDTO
    {
        public string MaDichVu { get; set; } = default!;

        public string TenDichVu { get; set; } = default!;

        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }

    }
    public class CreateDichVuDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenDichVu { get; set; } = default!;

        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }

        public DateTime? NgayTao { get; set; }

        public DateTime? NgaySua { get; set; }
    }
    public class UpdateDichVuDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenDichVu { get; set; } = default!;

        public string? MoTa { get; set; }

        public decimal DonGia { get; set; }
        [Required(ErrorMessage = "Ngày sửa phòng là bắt buộc.")]
        public DateTime? NgaySua { get; set; }
    }
}
