using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class PhanCong
{
    public string MaPhanCong { get; set; } = null!;

    public string MaNv { get; set; } = null!;

    public string MaCaLam { get; set; } = null!;

    public DateOnly NgayLam { get; set; }

    public virtual CaLamViec MaCaLamNavigation { get; set; } = null!;

    public virtual NhanVien MaNvNavigation { get; set; } = null!;
}
