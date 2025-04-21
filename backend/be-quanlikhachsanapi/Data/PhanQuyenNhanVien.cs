using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class PhanQuyenNhanVien
{
    public string MaNv { get; set; } = null!;

    public string MaRole { get; set; } = null!;

    public virtual NhanVien MaNvNavigation { get; set; } = null!;

    public virtual Role MaRoleNavigation { get; set; } = null!;
}
