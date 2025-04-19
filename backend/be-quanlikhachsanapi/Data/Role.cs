using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class Role
{
    public string MaRole { get; set; } = null!;

    public string? TenRole { get; set; }

    public string? MoTa { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual PhanQuyen? PhanQuyen { get; set; }
}
