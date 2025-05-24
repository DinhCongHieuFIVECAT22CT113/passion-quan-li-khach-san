using System;
using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class PhuongThucThanhToanDTO
    {
        public string MaPhuongThucThanhToan { get; set; } = null!;
        public string MaHoaDon { get; set; } = null!;
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

        [Required(ErrorMessage = "Phương thức thanh toán không được để trống")]
        [StringLength(150, ErrorMessage = "Phương thức thanh toán không được vượt quá 150 ký tự")]
        public string PhuongThucThanhToan { get; set; } = null!;

        public DateTime? NgayThanhToan { get; set; }
    }

    public class UpdatePhuongThucThanhToanDTO
    {
        
        [StringLength(150, ErrorMessage = "Phương thức thanh toán không được vượt quá 150 ký tự")]
        public string? PhuongThucThanhToan { get; set; }
        
        [StringLength(50, ErrorMessage = "Trạng thái không được vượt quá 50 ký tự")]
        
        public DateTime? NgayThanhToan { get; set; }
    }
}