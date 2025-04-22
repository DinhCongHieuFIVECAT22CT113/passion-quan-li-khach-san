// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using be_quanlikhachsanapi.ViewModel;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly QuanLyKhachSanContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher<KhachHang> _passwordHasher;
    private readonly ISendEmailServices _emailService;

    public AuthController(
        QuanLyKhachSanContext context,
        ITokenService tokenService,
        IPasswordHasher<KhachHang> passwordHasher,
        ISendEmailServices emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
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

        // Trả về thông tin người dùng và token
        return new UserDto
        {
            MaKh = khachHang.MaKh,
            UserName = khachHang.UserName,
            HoTen = khachHang.HoKh + " " + khachHang.TenKh, // Ghép họ tên
            Token = _tokenService.CreateToken(khachHang)
        };
    }

    [HttpPost("Đăng nhập")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserDto>> Login([FromForm] LoginDto loginDto)
    {
        // Tìm kiếm KhachHang theo UserName thay vì Email
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.UserName == loginDto.UserName);

        if (khachHang == null)
            // Cập nhật thông báo lỗi (tùy chọn)
            return Unauthorized("UserName không tồn tại hoặc không đúng."); 

        var result = _passwordHasher.VerifyHashedPassword(
            khachHang,
            khachHang.PasswordHash,
            loginDto.Password
        );

        if (result == PasswordVerificationResult.Failed)
            // Cập nhật thông báo lỗi (tùy chọn)
            return Unauthorized("Mật khẩu không đúng."); 

        // Phần trả về giữ nguyên
        return new UserDto
        {
            MaKh = khachHang.MaKh,
            UserName = khachHang.UserName, 
            HoTen = khachHang.HoKh + " " + khachHang.TenKh,
            Token = _tokenService.CreateToken(khachHang)
        };
    }
    
    [HttpPost("Đăng xuất")]
    [Authorize]
    public ActionResult Logout()
    {
        // Vì token JWT được lưu ở phía client, nên server không cần phải làm gì cả
        // Client sẽ xóa token từ bộ nhớ của họ
        return Ok(new { message = "Đăng xuất thành công" });
    }
    
    [HttpPost("Đổi mật khẩu")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> ChangePassword([FromForm] ChangePassDto changePassDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        // Lấy thông tin người dùng hiện tại từ token
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized("Không tìm thấy thông tin người dùng");
        }
        
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.UserName == username);
            
        if (khachHang == null)
        {
            return Unauthorized("Không tìm thấy thông tin người dùng");
        }
        
        // Kiểm tra mật khẩu hiện tại
        var passwordResult = _passwordHasher.VerifyHashedPassword(
            khachHang,
            khachHang.PasswordHash,
            changePassDto.Password
        );
        
        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return BadRequest("Mật khẩu hiện tại không đúng");
        }
        
        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (changePassDto.NewPassword != changePassDto.ConfirmPassword)
        {
            return BadRequest("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }
        
        // Cập nhật mật khẩu mới
        khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, changePassDto.NewPassword);
        khachHang.NgaySua = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Đổi mật khẩu thành công" });
    }
    
    [HttpPost("Quên mật khẩu")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> ForgotPassword([FromForm] ForgotPasswordDto forgotPasswordDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.Email == forgotPasswordDto.Email);
            
        if (khachHang == null)
        {
            // Trả về thành công ngay cả khi email không tồn tại để tránh tiết lộ thông tin
            return Ok(new { message = "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu" });
        }
        
        // Tạo token đặt lại mật khẩu (hết hạn sau 15 phút)
        var resetToken = GenerateResetToken();
        
        // Lưu token và thời gian hết hạn vào cache hoặc database
        // Ở đây, để đơn giản, tôi sẽ tạo một thuộc tính mới trong KhachHang
        khachHang.ResetPasswordToken = resetToken;
        khachHang.ResetPasswordTokenExpiry = DateTime.UtcNow.AddMinutes(15);
        
        await _context.SaveChangesAsync();
        
        // Gửi email với token
        var resetLink = $"https://yourwebsite.com/reset-password?token={resetToken}&email={khachHang.Email}";
        var emailModel = new EmailModel
        {
            ToEmail = khachHang.Email,
            Subject = "Đặt lại mật khẩu",
            Body = $@"
                <h2>Yêu cầu đặt lại mật khẩu</h2>
                <p>Chào {khachHang.HoKh} {khachHang.TenKh},</p>
                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
                <p><a href='{resetLink}'>Đặt lại mật khẩu</a></p>
                <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br>Đội ngũ quản lý khách sạn</p>
            ",
            ResetPasswordToken = resetToken
        };
        
        _emailService.SendEmail(emailModel);
        
        return Ok(new { message = "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn" });
    }
    
    [HttpPost("Đặt lại mật khẩu")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> ResetPassword([FromForm] ResetPasswordDto resetPasswordDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.Email == resetPasswordDto.Email);
            
        if (khachHang == null)
        {
            return BadRequest("Email không tồn tại");
        }
        
        // Kiểm tra token và thời gian hết hạn
        if (khachHang.ResetPasswordToken != resetPasswordDto.Token || 
            khachHang.ResetPasswordTokenExpiry < DateTime.UtcNow)
        {
            return BadRequest("Token không hợp lệ hoặc đã hết hạn");
        }
        
        // Cập nhật mật khẩu mới
        khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, resetPasswordDto.NewPassword);
        khachHang.NgaySua = DateTime.UtcNow;
        
        // Xóa token đặt lại mật khẩu
        khachHang.ResetPasswordToken = null;
        khachHang.ResetPasswordTokenExpiry = null;
        
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Đặt lại mật khẩu thành công" });
    }
    
    private string GenerateResetToken()
    {
        // Tạo token ngẫu nhiên
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes);
    }
    
    [HttpPost("Quên mật khẩu gửi ngẫu nhiên")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> ForgotPasswordRandomPassword([FromForm] ForgotPasswordDto forgotPasswordDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var khachHang = await _context.KhachHangs
            .SingleOrDefaultAsync(x => x.Email == forgotPasswordDto.Email);
            
        if (khachHang == null)
        {
            // Trả về thành công ngay cả khi email không tồn tại để tránh tiết lộ thông tin
            return Ok(new { message = "Nếu email tồn tại, chúng tôi đã gửi mật khẩu mới" });
        }
        
        // Tạo mật khẩu ngẫu nhiên
        var newPassword = GenerateRandomPassword();
        
        // Cập nhật mật khẩu mới
        khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, newPassword);
        khachHang.NgaySua = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        // Gửi email với mật khẩu mới
        var emailModel = new EmailModel
        {
            ToEmail = khachHang.Email,
            Subject = "Mật khẩu mới của bạn",
            Body = $@"
                <h2>Mật khẩu mới của bạn</h2>
                <p>Chào {khachHang.HoKh} {khachHang.TenKh},</p>
                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Mật khẩu mới của bạn là:</p>
                <p><strong>{newPassword}</strong></p>
                <p>Vui lòng đăng nhập và đổi mật khẩu này ngay sau khi đăng nhập thành công.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ ngay với chúng tôi.</p>
                <p>Trân trọng,<br>Đội ngũ quản lý khách sạn</p>
            "
        };
        
        _emailService.SendEmail(emailModel);
        
        return Ok(new { message = "Mật khẩu mới đã được gửi đến email của bạn" });
    }
    
    private string GenerateRandomPassword()
    {
        // Tạo mật khẩu ngẫu nhiên có độ dài 10 ký tự
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        var random = new Random();
        var password = new string(Enumerable.Repeat(chars, 10)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        
        return password;
    }
}