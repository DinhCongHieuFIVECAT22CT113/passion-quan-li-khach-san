using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.EntityFrameworkCore;
using be_quanlikhachsanapi.ViewModel;
using System.Linq;
using System.Threading.Tasks;
using be_quanlikhachsanapi.Helpers;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DataQlks113Nhom2Context _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher<KhachHang> _passwordHasherKh;
    private readonly IPasswordHasher<NhanVien> _passwordHasherNv;
    private readonly ISendEmailServices _sendEmail;
    private readonly IConfiguration _confMail;

    public AuthController(
        DataQlks113Nhom2Context context,
        ITokenService tokenService,
        IPasswordHasher<KhachHang> passwordHasherKh,
        IPasswordHasher<NhanVien> passwordHasherNv,
        ISendEmailServices sendEmail,
        IConfiguration confMail)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasherKh = passwordHasherKh;
        _passwordHasherNv = passwordHasherNv;
        _sendEmail = sendEmail;
        _confMail = confMail;
    }

    [HttpPost("register")]
    [AllowAnonymous]
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
        khachHang.PasswordHash = _passwordHasherKh.HashPassword(khachHang, registerDto.Password);
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

    [HttpOptions("login")]
    [AllowAnonymous]
    public IActionResult LoginOptions()
    {
        Console.WriteLine("🔧 OPTIONS request received for login endpoint");
        return Ok();
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserDto>> Login([FromForm] LoginDto loginDto)
    {
        Console.WriteLine($"🔐 Login attempt (Form): {loginDto?.UserName}");
        return await ProcessLogin(loginDto);
    }

    [HttpPost("login-json")]
    [AllowAnonymous]
    [Consumes("application/json")]
    public async Task<ActionResult<UserDto>> LoginJson([FromBody] LoginDto loginDto)
    {
        Console.WriteLine($"🔐 Login attempt (JSON): {loginDto?.UserName}");
        return await ProcessLogin(loginDto);
    }

    private async Task<ActionResult<UserDto>> ProcessLogin(LoginDto loginDto)
    {
        try
        {
            if (loginDto == null)
            {
                Console.WriteLine("❌ LoginDto is null");
                return BadRequest("Dữ liệu đăng nhập không hợp lệ");
            }

            Console.WriteLine($"🔍 Processing login for: {loginDto.UserName}");

        // Thử tìm trong bảng KhachHang
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.UserName == loginDto.UserName);

        if (khachHang != null)
        {
            Console.WriteLine($"👤 Found customer: {khachHang.UserName}");
            var result = _passwordHasherKh.VerifyHashedPassword(
                khachHang, khachHang.PasswordHash, loginDto.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                Console.WriteLine("❌ Customer password verification failed");
                return Unauthorized("Mật khẩu không đúng.");
            }

            Console.WriteLine("✅ Customer login successful");
            return _tokenService.CreateTokenWithRefresh(khachHang);
        }

        // Nếu không phải KhachHang, tìm trong bảng NhanVien
        var nhanVien = await _context.NhanViens
            .SingleOrDefaultAsync(x => x.UserName == loginDto.UserName);

        if (nhanVien == null)
        {
            Console.WriteLine($"❌ No user found with username: {loginDto.UserName}");
            return Unauthorized("Tài khoản không tồn tại.");
        }

        Console.WriteLine($"👨‍💼 Found employee: {nhanVien.UserName}");
        var resultNv = _passwordHasherNv.VerifyHashedPassword(
            nhanVien, nhanVien.PasswordHash, loginDto.Password);

        if (resultNv == PasswordVerificationResult.Failed)
        {
            Console.WriteLine("❌ Employee password verification failed");
            return Unauthorized("Mật khẩu không đúng.");
        }

        Console.WriteLine("✅ Employee login successful");
        return _tokenService.CreateTokenWithRefresh(nhanVien);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Login error: {ex.Message}");
            Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }

    [HttpPut("change-password")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserDto>> ChangePassword([FromForm] ChangePassDto changePassDto)
    {
        // Lấy username từ token
        var userName = User.FindFirst("username")?.Value;

        if (string.IsNullOrEmpty(userName))
        {
            return new JsonResult("Không xác định được username từ token.")
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };
        }

        var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.UserName == userName);
        var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.UserName == userName);

        if (khachHang == null && nhanVien == null)
        {
            return new JsonResult("Không tìm thấy tài khoản với username đã cho.")
            {
                StatusCode = StatusCodes.Status404NotFound
            };
        }
        bool isCustomer = khachHang != null;
        var user = isCustomer ? (object)khachHang : nhanVien;

        var isOldPasswordValid = isCustomer
            ? _passwordHasherKh.VerifyHashedPassword(khachHang, khachHang.PasswordHash, changePassDto.Password)
            : _passwordHasherNv.VerifyHashedPassword(nhanVien, nhanVien.PasswordHash, changePassDto.Password);

        if (isOldPasswordValid == PasswordVerificationResult.Failed)
        {
            return new JsonResult("Mật khẩu cũ không đúng.")
            {
                StatusCode = StatusCodes.Status400BadRequest
            };
        }
        if (changePassDto.NewPassword != changePassDto.ConfirmPassword)
        {
            return new JsonResult("Mật khẩu xác nhận không khớp.")
            {
                StatusCode = StatusCodes.Status400BadRequest
            };
        }
        if (isCustomer)
        {
            khachHang.PasswordHash = _passwordHasherKh.HashPassword(khachHang, changePassDto.NewPassword);
            _context.KhachHangs.Update(khachHang);
        }
        else
        {
            nhanVien.PasswordHash = _passwordHasherNv.HashPassword(nhanVien, changePassDto.NewPassword);
            _context.NhanViens.Update(nhanVien);
        }
        _context.SaveChanges();

        var email = new EmailModel
        {
            ToEmail = isCustomer ? khachHang.Email : nhanVien.Email,
            Subject = "Mật khẩu đăng nhập vừa được thay đổi",
            Body = "Bạn vừa thay đổi mật khẩu thành công. Nếu bạn không thực hiện điều này, vui lòng liên hệ với chúng tôi ngay."
        };

        _sendEmail.SendEmail(email);

        return new JsonResult("Đã thay đổi mật khẩu thành công.")
        {
            StatusCode = StatusCodes.Status200OK
        };
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserDto>> ResetPassword([FromForm] ResetPassDto resetPassDto)
    {
        var userName = resetPassDto.UserName;

        var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.UserName == userName);
        var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.UserName == userName);

        if (khachHang == null && nhanVien == null)
        {
            return new JsonResult("Không tìm thấy tài khoản với username đã cho.")
            {
                StatusCode = StatusCodes.Status404NotFound
            };
        }

        // Sinh mật khẩu ngẫu nhiên
        string password = Guid.NewGuid().ToString("N").Substring(0, 6); // Generate a random password

        if (khachHang != null)
        {
            khachHang.PasswordHash = _passwordHasherKh.HashPassword(khachHang, password);
            _context.KhachHangs.Update(khachHang);
        }
        else
        {
            nhanVien.PasswordHash = _passwordHasherNv.HashPassword(nhanVien, password);
            _context.NhanViens.Update(nhanVien);
        }
        _context.SaveChanges();

        var email = new EmailModel
        {
            ToEmail = khachHang?.Email ?? nhanVien.Email,
            Subject = "Mật khẩu đăng nhập đã được khôi phục",
            Body = $"Mật khẩu mới của bạn là: {password}"
        };

        // Gửi email xác nhận
        _sendEmail.SendEmail(email);

        return new JsonResult("Đã khôi phục mật khẩu thành công.")
        {
            StatusCode = StatusCodes.Status200OK
        };
    }

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserDto>> RefreshToken([FromForm] RefreshTokenDto refreshTokenDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = _tokenService.RefreshToken(refreshTokenDto);
        
        if (result == null)
        {
            return Unauthorized("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        return Ok(result);
    }
}


