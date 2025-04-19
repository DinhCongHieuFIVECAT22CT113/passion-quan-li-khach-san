using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class ApDungKm
{
    public string MaApDung { get; set; } = null!;

    public string MaKm { get; set; } = null!;

    public string MaDatPhong { get; set; } = null!;

    public decimal SoTienGiam { get; set; }

    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;

    public virtual KhuyenMai MaKmNavigation { get; set; } = null!;
}
