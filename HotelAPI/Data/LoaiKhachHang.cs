using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class LoaiKhachHang
{
    public string MaLoaiKh { get; set; } = null!;

    public string TenLoaiKh { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? UuDai { get; set; }

    public virtual ICollection<KhachHang> KhachHangs { get; set; } = new List<KhachHang>();
}
