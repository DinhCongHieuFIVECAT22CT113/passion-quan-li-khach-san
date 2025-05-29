using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class DatPhongDTO
    {
        public string MaDatPhong { get; set; }
        public string MaKH { get; set; }
        public string MaPhong { get; set; }
        public int? TreEm { get; set; }
        public int? NguoiLon { get; set; }
        public string GhiChu { get; set; }
        public int? SoLuongPhong { get; set; }
        public string ThoiGianDen { get; set; }
        public DateTime NgayNhanPhong { get; set; }
        public DateTime NgayTraPhong { get; set; }
        public string TrangThai { get; set; }
    }

    public class CreateDatPhongDTO
    {
        [Required(ErrorMessage = "Mã khách hàng là bắt buộc")]
        public string MaKH { get; set; }

        [Required(ErrorMessage = "Mã phòng là bắt buộc")]
        public string MaPhong { get; set; }

        public int? TreEm { get; set; }
        public int? NguoiLon { get; set; }
        public string GhiChu { get; set; }
        public int? SoLuongPhong { get; set; }
        public string ThoiGianDen { get; set; }

        [Required(ErrorMessage = "Ngày nhận phòng là bắt buộc")]
        public DateTime NgayNhanPhong { get; set; }

        [Required(ErrorMessage = "Ngày trả phòng là bắt buộc")]
        public DateTime NgayTraPhong { get; set; }

    }

    public class UpdateDatPhongDTO
    {
        public string MaPhong { get; set; }
        public int? TreEm { get; set; }
        public int? NguoiLon { get; set; }
        public string GhiChu { get; set; }
        public int? SoLuongPhong { get; set; }
        public string ThoiGianDen { get; set; }
        public DateTime? NgayNhanPhong { get; set; }
        public DateTime? NgayTraPhong { get; set; }
    }
}