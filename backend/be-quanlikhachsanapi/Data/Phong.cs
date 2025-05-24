using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class Phong
{
    public string MaPhong { get; set; } = null!;

    public string MaLoaiPhong { get; set; } = null!;

    public string SoPhong { get; set; } = null!;

    public string? Thumbnail { get; set; }

    public string? HinhAnh { get; set; }

    public string TrangThai { get; set; } = null!;

    public int? Tang { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual ICollection<ChiTietDatPhong> ChiTietDatPhongs { get; set; } = new List<ChiTietDatPhong>();

    public virtual LoaiPhong MaLoaiPhongNavigation { get; set; } = null!;
}
