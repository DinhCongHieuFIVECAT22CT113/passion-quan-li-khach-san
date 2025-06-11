using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class Review
{
    public string MaReview { get; set; } = null!;

    public string MaDatPhong { get; set; } = null!;

    public int DanhGia { get; set; }

    public string BinhLuan { get; set; } = null!;

    public string? TrangThai { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;
}
