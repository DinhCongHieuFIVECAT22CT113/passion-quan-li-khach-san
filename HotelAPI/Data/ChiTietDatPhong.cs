using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class ChiTietDatPhong
{
    public string MaChiTietDatPhong { get; set; } = null!;

    public string MaDatPhong { get; set; } = null!;

    public string MaLoaiPhong { get; set; } = null!;

    public string? MaPhong { get; set; }

    public int? SoDem { get; set; }

    public decimal? GiaTien { get; set; }

    public decimal? ThanhTien { get; set; }

    public string? TrangThai { get; set; }

    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;

    public virtual LoaiPhong MaLoaiPhongNavigation { get; set; } = null!;

    public virtual Phong? MaPhongNavigation { get; set; }
}
