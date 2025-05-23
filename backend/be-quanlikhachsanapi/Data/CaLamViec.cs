using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class CaLamViec
{
    public string MaCaLam { get; set; } = null!;

    public string TenCaLam { get; set; } = null!;

    public TimeOnly GioBatDau { get; set; }

    public TimeOnly GioKetThuc { get; set; }

    public virtual ICollection<PhanCong> PhanCongs { get; set; } = new List<PhanCong>();
}
