using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class DanhGium
{
    public string MaReview { get; set; } = null!;

    public string MaDatPhong { get; set; } = null!;

    public int DanhGia { get; set; }

    public string BinhLuan { get; set; } = null!;

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;
}
