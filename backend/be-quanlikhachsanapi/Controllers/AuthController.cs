// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly QuanLyKhachSanContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher<KhachHang> _passwordHasher;

    public AuthController(
        QuanLyKhachSanContext context,
        ITokenService tokenService,
        IPasswordHasher<KhachHang> passwordHasher)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto registerDto)
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
            NgayTao = DateTime.UtcNow
        };

        // Hash mật khẩu
        #pragma warning disable CS8601
        khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, registerDto.Password);
        #pragma warning restore CS8601

        _context.KhachHangs.Add(khachHang);
        await _context.SaveChangesAsync();

        // Trả về thông tin người dùng và token
        return new UserDto
        {
            MaKh = khachHang.MaKh,
            Email = khachHang.Email,
            HoTen = khachHang.HoKh + " " + khachHang.TenKh, // Ghép họ tên
            Token = _tokenService.CreateToken(khachHang)
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto loginDto)
    {
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.Email == loginDto.Email);

        if (khachHang == null)
            return Unauthorized("Email không tồn tại");

        var result = _passwordHasher.VerifyHashedPassword(
            khachHang,
            khachHang.PasswordHash,
            loginDto.Password
        );

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Mật khẩu không đúng");

        return new UserDto
        {
            MaKh = khachHang.MaKh,
            Email = khachHang.Email,
            HoTen = khachHang.HoKh + " " + khachHang.TenKh,
            Token = _tokenService.CreateToken(khachHang)
        };
    }
}