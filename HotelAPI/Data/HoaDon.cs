using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class HoaDon
{
    public string MaHoaDon { get; set; } = null!;

    public string MaDatPhong { get; set; } = null!;

    public string? MaKm { get; set; }

    public decimal? GiamGiaLoaiKm { get; set; }

    public decimal? GiamGiaLoaiKh { get; set; }

    public decimal TongTien { get; set; }

    public decimal? SoTienDaThanhToan { get; set; }

    public decimal? SoTienConThieu { get; set; }

    public decimal? SoTienThanhToanDu { get; set; }

    public string TrangThai { get; set; } = null!;

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;

    public virtual KhuyenMai? MaKmNavigation { get; set; }

    public virtual ICollection<PhuongThucThanhToan> PhuongThucThanhToans { get; set; } = new List<PhuongThucThanhToan>();
}
