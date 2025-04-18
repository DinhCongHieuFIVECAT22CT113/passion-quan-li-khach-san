using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class LoaiPhong
{
    public string MaLoaiPhong { get; set; } = null!;

    public string TenLoaiPhong { get; set; } = null!;

    public string? MoTa { get; set; }

    public decimal GiaMoiGio { get; set; }

    public decimal GiaMoiDem { get; set; }

    public int SoPhongTam { get; set; }

    public int SoGiuongNgu { get; set; }

    public int? GiuongDoi { get; set; }

    public int? GiuongDon { get; set; }

    public int KichThuocPhong { get; set; }

    public int SucChua { get; set; }

    public string? Thumbnail { get; set; }

    public string? HinhAnh { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual ICollection<ChiTietDatPhong> ChiTietDatPhongs { get; set; } = new List<ChiTietDatPhong>();

    public virtual ICollection<Phong> Phongs { get; set; } = new List<Phong>();
}
