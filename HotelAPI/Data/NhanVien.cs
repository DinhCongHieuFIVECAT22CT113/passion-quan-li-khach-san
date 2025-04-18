using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class NhanVien
{
    public string MaNv { get; set; } = null!;

    public string UserName { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string HoNv { get; set; } = null!;

    public string TenNv { get; set; } = null!;

    public string ChucVu { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Sdt { get; set; } = null!;

    public string MaCaLam { get; set; } = null!;

    public decimal LuongCoBan { get; set; }

    public DateTime NgayVaoLam { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual ICollection<BaoCaoDoanhThu> BaoCaoDoanhThus { get; set; } = new List<BaoCaoDoanhThu>();

    public virtual CaLamViec MaCaLamNavigation { get; set; } = null!;

    public virtual ICollection<PhanQuyen> PhanQuyens { get; set; } = new List<PhanQuyen>();
}
