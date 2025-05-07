using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class ChiTietDatPhongDto
    {
        public string MaChiTietDatPhong { get; set; } = null!;

        public string MaDatPhong { get; set; } = null!;

        public string MaLoaiPhong { get; set; } = null!;

        public string? MaPhong { get; set; }

        public int? SoDem { get; set; }

        public decimal? GiaTien { get; set; }

        public decimal? ThanhTien { get; set; }

        public string? TrangThai { get; set; }
    }
    public class CreateChiTietDatPhongDto
    {
        public string MaDatPhong { get; set; } = null!;

        public string MaLoaiPhong { get; set; } = null!;

        public string? MaPhong { get; set; }

        public int? SoDem { get; set; }

        public decimal? GiaTien { get; set; }

        public decimal? ThanhTien { get; set; }

        public string? TrangThai { get; set; }
    }
    public class UpdateChiTietDatPhongDto
    {
        public string MaDatPhong { get; set; } = null!;

        public string MaLoaiPhong { get; set; } = null!;

        public string? MaPhong { get; set; }

        public int? SoDem { get; set; }

        public decimal? GiaTien { get; set; }

        public decimal? ThanhTien { get; set; }

        public string? TrangThai { get; set; }
    }
}
