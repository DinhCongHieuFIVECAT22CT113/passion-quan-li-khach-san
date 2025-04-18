using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class CaLamViec
{
    public string MaCaLam { get; set; } = null!;

    public string TenCaLam { get; set; } = null!;

    public DateTime GioBatDau { get; set; }

    public DateTime GioKetThuc { get; set; }

    public virtual ICollection<NhanVien> NhanViens { get; set; } = new List<NhanVien>();
}
