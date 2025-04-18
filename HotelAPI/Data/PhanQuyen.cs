using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class PhanQuyen
{
    public string MaRole { get; set; } = null!;

    public string? MaKh { get; set; }

    public string? MaNv { get; set; }

    public virtual KhachHang? MaKhNavigation { get; set; }

    public virtual NhanVien? MaNvNavigation { get; set; }

    public virtual Role MaRoleNavigation { get; set; } = null!;
}
