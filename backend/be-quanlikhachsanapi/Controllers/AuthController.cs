using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.EntityFrameworkCore;
using be_quanlikhachsanapi.ViewModel;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly QuanLyKhachSanContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher<KhachHang> _passwordHasher;
    private readonly IPasswordHasher<NhanVien> _passwordHasherNv;
    private readonly ISendEmailServices _sendEmail;
    private readonly IConfiguration _confMail;

    public AuthController(
        QuanLyKhachSanContext context,
        ITokenService tokenService,
        IPasswordHasher<KhachHang> passwordHasher,
        IPasswordHasher<NhanVien> passwordHasherNv,
        ISendEmailServices sendEmail,
        IConfiguration confMail)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _passwordHasherNv = passwordHasherNv;
        _sendEmail = sendEmail;
        _confMail = confMail;
    }

    [HttpPost("Đăng ký")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserDto>> Register([FromForm] RegisterDto registerDto)
    {
        // Kiểm tra ModelState (bao gồm cả xác nhận mật khẩu)
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Kiểm tra Email tồn tại
        if (await _context.KhachHangs.AnyAsync(x => x.Email == registerDto.Email))
        {
            return BadRequest("Email đã tồn tại");
        }

        // Kiểm tra UserName tồn tại
        if (await _context.KhachHangs.AnyAsync(x => x.UserName == registerDto.UserName))
        {
            return BadRequest("UserName đã tồn tại");
        }

        // --- Auto Increment MaKh --- START ---
        string newMaKh;
        var lastKhachHang = await _context.KhachHangs
                                        .OrderByDescending(kh => kh.MaKh)
                                        .FirstOrDefaultAsync();

        if (lastKhachHang == null || !lastKhachHang.MaKh.StartsWith("KH"))
        {
            // Nếu chưa có KH nào hoặc MaKh không bắt đầu bằng "KH"
            newMaKh = "KH001"; // Bắt đầu từ KH001
        }
        else
        {
            // Cố gắng tách phần số (sau "KH")
            if (int.TryParse(lastKhachHang.MaKh.Substring(2), out int lastId))
            {
                int newId = lastId + 1;
                newMaKh = "KH" + newId.ToString("D3"); // Định dạng thành KHxxx (3 chữ số)
            }
            else
            {
                // Nếu không thể parse số (MaKh không đúng định dạng), quay về mặc định
                newMaKh = "KH001"; 
            }
        }
        // --- Auto Increment MaKh --- END ---

        var khachHang = new KhachHang
        {
            MaKh = newMaKh,
            UserName = registerDto.UserName,
            Email = registerDto.Email,
            HoKh = registerDto.HoKh,
            TenKh = registerDto.TenKh,
            SoCccd = registerDto.SoCccd,
            Sdt = registerDto.SoDienThoai,
            MaRole = "R04",
            MaLoaiKh = "LKH001",
            NgayTao = DateTime.UtcNow
        };

        // Hash mật khẩu
        #pragma warning disable CS8601
        khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, registerDto.Password);
        #pragma warning restore CS8601

        _context.KhachHangs.Add(khachHang);
        await _context.SaveChangesAsync();

        var email = new EmailModel
        {
            ToEmail = khachHang.Email,
            Subject = "Tài khoản của bạn đã được khởi tạo thành công",
            Body = $"Xin chào {khachHang.HoKh} {khachHang.TenKh},\n\n" +
                $"Thông tin tài khoản của bạn:\n- Username: {khachHang.UserName}\n- Mật khẩu: {registerDto.Password}\n\n" +
                "Vui lòng đăng nhập để thay đổi mật khẩu sau lần đăng nhập đầu tiên.\n\n" +
                "Trân trọng,\nHệ thống Quản Lý Khách Sạn."
        };

        // Gửi Email
        _sendEmail.SendEmail(email);
        
        // Trả về thông tin người dùng và token
        return new UserDto
        {
            MaNguoiDung = khachHang.MaKh,
            UserName = khachHang.UserName,
            HoTen = khachHang.HoKh + " " + khachHang.TenKh, // Ghép họ tên
            //Token = _tokenService.CreateToken(khachHang)
        };
    }

    [HttpPost("Đăng nhập")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserDto>> Login([FromForm] LoginDto loginDto)
    {
        // Thử tìm trong bảng KhachHang
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.UserName == loginDto.UserName);

        if (khachHang != null)
        {
            var result = _passwordHasher.VerifyHashedPassword(
                khachHang, khachHang.PasswordHash, loginDto.Password);

            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Mật khẩu không đúng.");

            return new UserDto
            {
                MaNguoiDung = khachHang.MaKh,
                UserName = khachHang.UserName,
                HoTen = khachHang.HoKh + " " + khachHang.TenKh,
                MaRole = khachHang.MaRole ?? "CTM", // Nếu rỗng thì gán mặc định là CTM
                Token = _tokenService.CreateToken(khachHang)
            };
        }

        // Nếu không phải KhachHang, tìm trong bảng NhanVien
        var nhanVien = await _context.NhanViens
            .SingleOrDefaultAsync(x => x.UserName == loginDto.UserName);

        if (nhanVien == null)
            return Unauthorized("Tài khoản không tồn tại.");

        var resultNv = _passwordHasherNv.VerifyHashedPassword(
            nhanVien, nhanVien.PasswordHash, loginDto.Password);

        if (resultNv == PasswordVerificationResult.Failed)
            return Unauthorized("Mật khẩu không đúng.");

        return new UserDto
        {
            MaNguoiDung = nhanVien.MaNv,
            UserName = nhanVien.UserName,
            HoTen = nhanVien.HoNv + " " + nhanVien.TenNv,
            MaRole = nhanVien.MaRole ?? "CRW", // Nếu rỗng thì gán mặc định là CRW
            Token = _tokenService.CreateToken(nhanVien)
        };
    }
}