namespace be_quanlikhachsanapi.DTOs
{
    public class DatPhongDTO
    {
        public string MaDatPhong { get; set; }
        public string MaKH { get; set; }
        public string MaPhong { get; set; }
        public int? TreEm { get; set; }
        public int? NguoiLon { get; set; }
        public string GhiChu { get; set; }
        public int? SoLuongPhong { get; set; }
        public string ThoiGianDen { get; set; }
        public DateTime NgayNhanPhong { get; set; }
        public DateTime NgayTraPhong { get; set; }
        public string TrangThai { get; set; }
    }

    public class CreateDatPhongDTO
    {   
        public string MaKH { get; set; }
        public string MaPhong { get; set; }
        public int? TreEm { get; set; }
        public int? NguoiLon { get; set; }
        public string GhiChu { get; set; }
        public int? SoLuongPhong { get; set; }
        public string ThoiGianDen { get; set; }
        public DateTime NgayNhanPhong { get; set; }
        public DateTime NgayTraPhong { get; set; }

    }

    public class UpdateDatPhongDTO
    {   
        public int? TreEm { get; set; }
        public int? NguoiLon { get; set; }
        public string GhiChu { get; set; }
        public int? SoLuongPhong { get; set; }
        public string ThoiGianDen { get; set; }
        public DateTime? NgayNhanPhong { get; set; }
        public DateTime? NgayTraPhong { get; set; }
    }
}