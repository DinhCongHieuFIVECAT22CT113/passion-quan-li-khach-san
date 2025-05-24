namespace be_quanlikhachsanapi.DTOs
{
    public class NhanVienDTO
    {
        public string MaNv { get; set; } = default!;
        public string UserName { get; set; } = default!;

        public string HoNv { get; set; } = default!;
        public string TenNv { get; set; } = default!;

        public string ChucVu { get; set; } = default!;

        public string Email { get; set; } = null!;
        public string Sdt { get; set; } = null!;
        public decimal LuongCoBan { get; set; }
        public DateTime NgayVaoLam { get; set; }
        public string MaRole { get; set; } = null!;

    }

    public class CreateNhanVienDTO
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!; // Mật khẩu thô, bạn sẽ hash nó trong service
        public string HoNv { get; set; } = null!;
        public string TenNv { get; set; } = null!;
        public string ChucVu { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Sdt { get; set; } = null!;
        public decimal LuongCoBan { get; set; }
        public string MaRole { get; set; } = null!;
        public DateTime NgayVaoLam { get; set; }

    }

    public class UpdateNhanVienDTO
    {
        public string ChucVu { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Sdt { get; set; } = null!;
        public decimal LuongCoBan { get; set; }
        public string MaRole { get; set; } = null!;

    }
}