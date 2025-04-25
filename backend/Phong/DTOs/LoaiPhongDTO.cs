namespace QLKS.DTOs
{
    public class LoaiPhongDTO
    {
        public string MaLoaiPhong { get; set; }
        public string TenLoaiPhong { get; set; }
        public string? MoTa { get; set; }
        public decimal GiaMoiGio { get; set; }
        public decimal GiaMoiDem { get; set; }
        public int SoPhongTam { get; set; }
        public int SoGiuongNgu { get; set; }
        public int GiuongDoi { get; set; }
        public int GiuongDon { get; set; }
        public int KichThuocPhong { get; set; }
        public int SucChua { get; set; }
        public string? Thumbnail { get; set; }
        public string? HinhAnh { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgaySua { get; set; }
    }
} 