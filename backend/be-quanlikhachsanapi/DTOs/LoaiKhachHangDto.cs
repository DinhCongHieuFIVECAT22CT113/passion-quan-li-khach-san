namespace be_quanlikhachsanapi.DTOs
{
    public class LoaiKhachHangDto
    {
        public string MaLoaiKh { get; set; } = null!;
        public string TenLoaiKh { get; set; } = null!;
        public string? MoTa { get; set; }
        public string? UuDai { get; set; }
    }
    public class CreateLoaiKhachHangDto
    {
        public string TenLoaiKh { get; set; } = null!;
        public string? MoTa { get; set; }
        public string? UuDai { get; set; }
    }

    public class UpdateLoaiKhachHangDto
    {
        public string? TenLoaiKh { get; set; }
        public string? MoTa { get; set; }
        public string? UuDai { get; set; }
    }

}