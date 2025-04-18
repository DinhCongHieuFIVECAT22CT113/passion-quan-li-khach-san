using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class KhuyenMai
{
    public string MaKm { get; set; } = null!;

    public string TenKhuyenMai { get; set; } = null!;

    public string MoTa { get; set; } = null!;

    public string MaGiamGia { get; set; } = null!;

    public int PhanTramGiam { get; set; }

    public decimal SoTienGiam { get; set; }

    public DateTime NgayBatDau { get; set; }

    public DateTime NgayKetThuc { get; set; }

    public string TrangThai { get; set; } = null!;

    public virtual ICollection<ApDungKm> ApDungKms { get; set; } = new List<ApDungKm>();

    public virtual ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();
}
