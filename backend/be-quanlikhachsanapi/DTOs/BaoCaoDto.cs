using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace be_quanlikhachsanapi.DTOs
{
    public class BaoCaoDoanhThuDTO
    {
        public string MaBaoCao { get; set; } = null!;
        public int Thang { get; set; }
        public int Nam { get; set; }
        public decimal TongDoanhThu { get; set; }
        public int TongDatPhong { get; set; }
        public int TongDichVuDaSuDung { get; set; }
        public DateTime? NgayTao { get; set; }
        public string MaNv { get; set; } = null!;
        public string? TenNhanVien { get; set; }
    }

    public class CreateBaoCaoDoanhThuDTO
    {
        [Required]
        public int Thang { get; set; }
        [Required]
        public int Nam { get; set; }
        [Required]
        public decimal TongDoanhThu { get; set; }
        [Required]
        public int TongDatPhong { get; set; }
        [Required]
        public int TongDichVuDaSuDung { get; set; }
        [Required]
        public string MaNv { get; set; } = null!;
    }

    public class UpdateBaoCaoDoanhThuDTO
    {
        [Required]
        public decimal TongDoanhThu { get; set; }
        [Required]
        public int TongDatPhong { get; set; }
        [Required]
        public int TongDichVuDaSuDung { get; set; }
    }
}
