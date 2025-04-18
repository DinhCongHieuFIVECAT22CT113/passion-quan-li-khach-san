using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class PhuongThucThanhToan
{
    public string MaPhuongThucThanhToan { get; set; } = null!;

    public string MaHoaDon { get; set; } = null!;

    public decimal SoTienCanThanhToan { get; set; }

    public string PhuongThucThanhToan1 { get; set; } = null!;

    public string TrangThai { get; set; } = null!;

    public DateTime? NgayThanhToan { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual HoaDon MaHoaDonNavigation { get; set; } = null!;
}
