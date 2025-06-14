﻿using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class ChiTietDatPhong
{
    public string MaChiTietDatPhong { get; set; } = null!;

    public string MaDatPhong { get; set; } = null!;

    public string MaLoaiPhong { get; set; } = null!;

    public string? MaPhong { get; set; }

    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;

    public virtual LoaiPhong MaLoaiPhongNavigation { get; set; } = null!;

    public virtual Phong? MaPhongNavigation { get; set; }
}
