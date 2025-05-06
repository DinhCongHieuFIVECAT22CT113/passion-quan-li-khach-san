using System;
using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class PhuongThucThanhToanDTO
    {
        public string MaPhuongThucThanhToan { get; set; } = null!;
        public string MaHoaDon { get; set; } = null!;
        public decimal SoTienCanThanhToan { get; set; }
        public string PhuongThucThanhToan { get; set; } = null!;
        public string TrangThai { get; set; } = null!;
        public DateTime? NgayThanhToan { get; set; }
        public DateTime? NgayTao { get; set; }
        public DateTime? NgaySua { get; set; }
    }

    public class CreatePhuongThucThanhToanDTO
    {
        [Required(ErrorMessage = "Mã hóa đơn không được để trống")]
        public string MaHoaDon { get; set; } = null!;

        [Required(ErrorMessage = "Số tiền cần thanh toán không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Số tiền cần thanh toán phải lớn hơn hoặc bằng 0")]
        public decimal SoTienCanThanhToan { get; set; }

        [Required(ErrorMessage = "Phương thức thanh toán không được để trống")]
        [StringLength(150, ErrorMessage = "Phương thức thanh toán không được vượt quá 150 ký tự")]
        public string PhuongThucThanhToan { get; set; } = null!;

        [Required(ErrorMessage = "Trạng thái không được để trống")]
        [StringLength(50, ErrorMessage = "Trạng thái không được vượt quá 50 ký tự")]
        public string TrangThai { get; set; } = null!;

        public DateTime? NgayThanhToan { get; set; }
    }

    public class UpdatePhuongThucThanhToanDTO
    {
        public decimal? SoTienCanThanhToan { get; set; }
        
        [StringLength(150, ErrorMessage = "Phương thức thanh toán không được vượt quá 150 ký tự")]
        public string? PhuongThucThanhToan { get; set; }
        
        [StringLength(50, ErrorMessage = "Trạng thái không được vượt quá 50 ký tự")]
        public string? TrangThai { get; set; }
        
        public DateTime? NgayThanhToan { get; set; }
    }
}