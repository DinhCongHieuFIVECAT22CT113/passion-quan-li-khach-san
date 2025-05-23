using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class DatPhong
{
    public string MaDatPhong { get; set; } = null!;

    public string? MaKh { get; set; }

    public int? TreEm { get; set; }

    public int? NguoiLon { get; set; }

    public string? GhiChu { get; set; }

    public int? SoLuongPhong { get; set; }

    public string? ThoiGianDen { get; set; }

    public DateTime NgayNhanPhong { get; set; }

    public DateTime NgayTraPhong { get; set; }

    public string? TrangThai { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual ICollection<ApDungKm> ApDungKms { get; set; } = new List<ApDungKm>();

    public virtual ICollection<ChiTietDatPhong> ChiTietDatPhongs { get; set; } = new List<ChiTietDatPhong>();

    public virtual ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();

    public virtual KhachHang? MaKhNavigation { get; set; }

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<SuDungDichVu> SuDungDichVus { get; set; } = new List<SuDungDichVu>();
}
