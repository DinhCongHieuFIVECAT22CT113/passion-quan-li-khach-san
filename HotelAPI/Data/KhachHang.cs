using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class KhachHang
{
    public string MaKh { get; set; } = null!;

    public string UserName { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string HoKh { get; set; } = null!;

    public string TenKh { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Sdt { get; set; } = null!;

    public string? DiaChi { get; set; }

    public string SoCccd { get; set; } = null!;

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public string? MaLoaiKh { get; set; }

    public virtual ICollection<DatPhong> DatPhongs { get; set; } = new List<DatPhong>();

    public virtual LoaiKhachHang? MaLoaiKhNavigation { get; set; }

    public virtual ICollection<PhanQuyen> PhanQuyens { get; set; } = new List<PhanQuyen>();
}
