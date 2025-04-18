using System;
using System.Collections.Generic;

namespace HotelAPI.Data;

public partial class SuDungDichVu
{
    public string MaSuDung { get; set; } = null!;

    public string? MaDatPhong { get; set; }

    public string? MaDichVu { get; set; }

    public int? SoLuong { get; set; }

    public decimal? TongTien { get; set; }

    public DateTime? NgaySuDung { get; set; }

    public byte[]? ThoiGianSuDung { get; set; }

    public string? TrangThai { get; set; }

    public virtual DatPhong? MaDatPhongNavigation { get; set; }

    public virtual DichVu? MaDichVuNavigation { get; set; }
}
