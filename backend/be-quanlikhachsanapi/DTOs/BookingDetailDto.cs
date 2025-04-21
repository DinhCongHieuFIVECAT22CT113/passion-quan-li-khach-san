using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class ThemDichVuVaoDatPhongDto
    {
        [Required(ErrorMessage = "Mã dịch vụ là bắt buộc")]
        public string MaDichVu { get; set; } = default!;
        
        [Required(ErrorMessage = "Số lượng là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int SoLuong { get; set; }
    }

    public class ApDungKhuyenMaiChoDatPhongDto
    {
        [Required(ErrorMessage = "Mã khuyến mãi là bắt buộc")]
        public string MaKhuyenMai { get; set; } = default!;
    }
} 