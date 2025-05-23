using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class BaoCaoDoanhThu
{
    public string MaBaoCao { get; set; } = null!;

    public int Thang { get; set; }

    public int Nam { get; set; }

    public decimal TongDoanhThu { get; set; }

    public int TongDatPhong { get; set; }

    public int TongDichVuDaSuDung { get; set; }

    public DateTime? NgayTao { get; set; }

    public string MaNv { get; set; } = null!;

    public virtual NhanVien MaNvNavigation { get; set; } = null!;
}
