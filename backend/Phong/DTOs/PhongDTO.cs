namespace QLKS.DTOs
{
    public class PhongDTO
    {
        public string MaPhong { get; set; }
        public string MaLoaiPhong { get; set; }
        public string SoPhong { get; set; }
        public string? Thumbnail { get; set; }
        public string? HinhAnh { get; set; }
        public string TrangThai { get; set; }
        public int Tang { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgaySua { get; set; }
    }
} 