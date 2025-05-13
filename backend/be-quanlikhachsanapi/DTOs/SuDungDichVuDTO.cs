using System;
using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class SuDungDichVuDTO
    {
        public string MaSuDung { get; set; }
        public string? MaDatPhong { get; set; }
        public string? MaDichVu { get; set; }
        public int? SoLuong { get; set; }
        public decimal? TongTien { get; set; }
        public DateTime? NgaySuDung { get; set; }
        public string? TrangThai { get; set; }
        
        // Thêm thông tin bổ sung
        public string? TenDichVu { get; set; }
        public decimal? DonGia { get; set; }
    }

    public class CreateSuDungDichVuDTO
    {
        [Required(ErrorMessage = "Mã đặt phòng không được để trống")]
        public string MaDatPhong { get; set; }

        [Required(ErrorMessage = "Mã dịch vụ không được để trống")]
        public string MaDichVu { get; set; }

        [Required(ErrorMessage = "Số lượng không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int SoLuong { get; set; }

        public DateTime? NgaySuDung { get; set; }

        public string? TrangThai { get; set; } = "Đã sử dụng";
    }

    public class UpdateSuDungDichVuDTO
    {
        public string? MaDatPhong { get; set; }
        public string? MaDichVu { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int? SoLuong { get; set; }

        public DateTime? NgaySuDung { get; set; }
        public string? TrangThai { get; set; }
    }
}