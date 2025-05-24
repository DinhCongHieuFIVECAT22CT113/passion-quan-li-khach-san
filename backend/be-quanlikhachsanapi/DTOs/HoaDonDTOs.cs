using System;
using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class HoaDonDTO
    {
        public string MaHoaDon { get; set; } = null!;
        public string MaDatPhong { get; set; } = null!;
        public string? MaKM { get; set; }
        public string? TenKhuyenMai { get; set; }
        public decimal? GiamGiaLoaiKM { get; set; }
        public decimal? GiamGiaLoaiKH { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; } = null!;
        public DateTime? NgayTao { get; set; }
        public DateTime? NgaySua { get; set; }
    }

    public class CreateHoaDonDTO
    {
        [Required(ErrorMessage = "Mã đặt phòng không được để trống")]
        public string MaDatPhong { get; set; } = null!;
        
        public string? MaKM { get; set; }
        
        public decimal? GiamGiaLoaiKM { get; set; }
        
        public decimal? GiamGiaLoaiKH { get; set; }
        
        [Required(ErrorMessage = "Tổng tiền không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Tổng tiền phải lớn hơn hoặc bằng 0")]
        public decimal TongTien { get; set; }
        
    }

    public class UpdateHoaDonDTO
    {
        public string? MaKM { get; set; }
        
        public decimal? GiamGiaLoaiKM { get; set; }
        
        public decimal? GiamGiaLoaiKH { get; set; }
        
        public decimal? TongTien { get; set; }
        
    }
}