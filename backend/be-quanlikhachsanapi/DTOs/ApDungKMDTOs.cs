using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class CreateApDungKMDTO
    {
        [Required(ErrorMessage = "Mã khuyến mãi không được để trống")]
        public string MaKM { get; set; } = null!;

        [Required(ErrorMessage = "Mã đặt phòng không được để trống")]
        public string MaDatPhong { get; set; } = null!;

        [Required(ErrorMessage = "Số tiền giảm không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Số tiền giảm phải lớn hơn hoặc bằng 0")]
        public decimal SoTienGiam { get; set; }
    }

    public class UpdateApDungKMDTO
    {
        public string? MaKM { get; set; }
        public string? MaDatPhong { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Số tiền giảm phải lớn hơn hoặc bằng 0")]
        public decimal? SoTienGiam { get; set; }
    }

    public class ApDungKMDTO
    {
        public string MaApDung { get; set; } = null!;
        public string MaKM { get; set; } = null!;
        public string TenKhuyenMai { get; set; } = null!;
        public string MaDatPhong { get; set; } = null!;
        public decimal SoTienGiam { get; set; }
    }
}