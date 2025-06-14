﻿using System;
using System.Collections.Generic;

namespace be_quanlikhachsanapi.Data;

public partial class DichVu
{
    public string MaDichVu { get; set; } = null!;

    public string TenDichVu { get; set; } = null!;

    public string? Thumbnail { get; set; }

    public string? MoTa { get; set; }

    public decimal DonGia { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    public virtual ICollection<SuDungDichVu> SuDungDichVus { get; set; } = new List<SuDungDichVu>();
}
