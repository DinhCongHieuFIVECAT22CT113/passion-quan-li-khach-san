using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using be_quanlikhachsanapi.Models;
using be_quanlikhachsanapi.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Security.Claims;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatPhongController : ControllerBase
    {
        private readonly IDatPhongRepository _datPhongRepo;
        private readonly ISendEmailServices _sendEmail;
        private readonly DataQlks113Nhom2Context _context;
        private readonly INotificationService _notificationService;

        // Tạm lưu booking chưa xác nhận (bạn nên chuyển sang cache hoặc DB)
        private static readonly Dictionary<string, PendingGuestBooking> _pendingBookings = new();

        public DatPhongController(
            IDatPhongRepository datPhongRepo, 
            ISendEmailServices sendEmail,
            DataQlks113Nhom2Context context,
            INotificationService notificationService)
        {
            _datPhongRepo = datPhongRepo;
            _sendEmail = sendEmail;
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        [Authorize]
        [RequireRole("R00", "R01", "R02", "R03")]
        public IActionResult GetAll()
        {
            var datPhongs = _datPhongRepo.GetAll();
            if (datPhongs == null || datPhongs.Count == 0)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng nào.");
            }
            return Ok(datPhongs);
        }

        [HttpGet("{maDatPhong}")]
        [Authorize]
        [RequireRole("R00", "R01", "R02", "R04")]
        public IActionResult GetByID(string maDatPhong)
        {
            var datPhong = _datPhongRepo.GetDatPhongById(maDatPhong);
            if (datPhong == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(datPhong);
        }

        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public IActionResult CreateDatPhong([FromForm] CreateDatPhongDTO createDatPhong)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                        .ToList();

                    return BadRequest(new {
                        message = "Dữ liệu không hợp lệ",
                        errors = errors
                    });
                }

                var datPhong = _datPhongRepo.CreateDatPhong(createDatPhong);
                if (datPhong == null)
                {
                    return BadRequest(new { message = "Không thể tạo thông tin đặt phòng mới." });
                }
                return Ok(datPhong);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ✅ API công khai cho khách vãng lai đặt phòng trực tiếp
        [HttpPost("Guest")]
        [AllowAnonymous]
        [Consumes("multipart/form-data")]
        public IActionResult CreateGuestBooking([FromForm] CreateDatPhongDTO createDatPhong)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                        .ToList();

                    return BadRequest(new {
                        message = "Dữ liệu không hợp lệ",
                        errors = errors
                    });
                }

                var datPhong = _datPhongRepo.CreateDatPhong(createDatPhong);
                if (datPhong == null)
                {
                    return BadRequest(new { message = "Không thể tạo thông tin đặt phòng mới." });
                }
                return Ok(datPhong);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ✅ API tạo booking tạm thời cho khách vãng lai, gửi mã xác nhận
        [HttpPost("GuestPending")]
        [AllowAnonymous]
        [Consumes("multipart/form-data")]
        public IActionResult CreatePendingGuestBooking([FromForm] PendingGuestBooking booking)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(new { errors });
            }

            // Đảm bảo các giá trị mặc định
            booking.Id = Guid.NewGuid().ToString();
            booking.MaXacNhan = new Random().Next(100000, 999999).ToString();
            booking.Confirmed = false;
            booking.ThoiGianDen ??= "14:00";
            booking.SoNguoiLon = booking.SoNguoiLon == 0 ? 1 : booking.SoNguoiLon;
            booking.CreatedAt = DateTime.Now;

            _pendingBookings[booking.Id] = booking;

            // Gửi email với mã xác nhận
            try {
                var emailModel = new EmailModel
                {
                    ToEmail = booking.Email,
                    Subject = "Xác nhận đặt phòng - Passion Hotel",
                    Body = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>
                                <h2 style='color: #4a4a4a;'>Xác nhận đặt phòng</h2>
                                <p>Kính gửi Quý khách,</p>
                                <p>Cảm ơn Quý khách đã đặt phòng tại Passion Hotel. Để hoàn tất quá trình đặt phòng, vui lòng sử dụng mã xác nhận dưới đây:</p>
                                <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;'>
                                    <h3 style='margin: 0; color: #e63946; font-size: 24px;'>{booking.MaXacNhan}</h3>
                                </div>
                                <p>Thông tin đặt phòng:</p>
                                <ul>
                                    <li>Họ tên: {booking.HoTen}</li>
                                    <li>Ngày nhận phòng: {booking.NgayNhanPhong}</li>
                                    <li>Ngày trả phòng: {booking.NgayTraPhong}</li>
                                    <li>Số người: {booking.SoNguoiLon} người lớn, {booking.SoTreEm} trẻ em</li>
                                </ul>
                                <p>Vui lòng không chia sẻ mã xác nhận này với người khác.</p>
                                <p>Trân trọng,<br>Passion Hotel</p>
                            </div>
                        </body>
                        </html>"
                };

                bool emailSent = _sendEmail.SendEmail(emailModel);
                Console.WriteLine($"Gửi email xác nhận cho booking {booking.Id}: {(emailSent ? "Thành công" : "Thất bại")}");
                Console.WriteLine($"Mã xác nhận cho booking {booking.Id}: {booking.MaXacNhan}");
            }
            catch (Exception ex) {
                Console.WriteLine($"Lỗi khi gửi email: {ex.Message}");
                // Vẫn tiếp tục xử lý, không trả về lỗi cho người dùng
            }

            return Ok(new { 
                bookingId = booking.Id,
                maXacNhan = booking.MaXacNhan, // Trả về mã xác nhận để test (trong thực tế sẽ gửi qua email)
                message = "Đặt phòng tạm thời thành công. Vui lòng kiểm tra email để xác nhận."
            });
        }

        // ✅ API xác nhận mã xác nhận, tạo booking chính thức
        [HttpPost("GuestConfirm")]
        [AllowAnonymous]
        public IActionResult ConfirmGuestBooking([FromForm] string bookingId, [FromForm] string maXacNhan)
        {
            if (!_pendingBookings.TryGetValue(bookingId, out var booking))
            {
                return NotFound("Không tìm thấy yêu cầu đặt phòng tạm.");
            }

            if (booking.MaXacNhan != maXacNhan)
            {
                return BadRequest("Mã xác nhận không đúng.");
            }

            // Kiểm tra booking.Email có tồn tại trong bảng KhachHang hay không
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.Email == booking.Email);
            string maKhachHang;
            
            if (khachHang == null)
            {
                // Tạo khách hàng mới cho khách vãng lai
                var lastKhachHang = _context.KhachHangs
                    .OrderByDescending(kh => kh.MaKh)
                    .FirstOrDefault();
                
                string newMaKhachHang;
                if (lastKhachHang == null || string.IsNullOrEmpty(lastKhachHang.MaKh))
                {
                    newMaKhachHang = "KH001";
                }
                else
                {
                    var soHienTai = int.Parse(lastKhachHang.MaKh.Substring(2));
                    newMaKhachHang = "KH" + (soHienTai + 1).ToString("D3");
                }
                
                // Tạo khách hàng mới
                var newKhachHang = new KhachHang
                {
                    MaKh = newMaKhachHang,
                    HoKh = booking.HoTen.Split(' ')[0],
                    TenKh = booking.HoTen.Contains(' ') ? booking.HoTen.Substring(booking.HoTen.IndexOf(' ') + 1) : booking.HoTen,
                    Email = booking.Email,
                    Sdt = booking.SoDienThoai,
                    MaLoaiKh = "LKH001", // Loại khách hàng thường
                    UserName = booking.Email,
                    PasswordHash = "DefaultPassword123", // Mật khẩu mặc định, nên được hash trong thực tế
                    SoCccd = "000000000000", // Giá trị mặc định
                    NgayTao = DateTime.Now,
                    NgaySua = DateTime.Now
                };
                
                _context.KhachHangs.Add(newKhachHang);
                _context.SaveChanges();
                
                maKhachHang = newMaKhachHang;
            }
            else
            {
                maKhachHang = khachHang.MaKh;
            }
            
            var createDto = new CreateDatPhongDTO
            {
                // Chuyển dữ liệu từ booking vào DTO
                MaKH = maKhachHang, // Sử dụng mã khách hàng đã tìm được
                MaPhong = booking.MaPhong,
                NgayNhanPhong = DateTime.Parse(booking.NgayNhanPhong),
                NgayTraPhong = DateTime.Parse(booking.NgayTraPhong),
                TreEm = booking.SoTreEm,
                NguoiLon = booking.SoNguoiLon,
                GhiChu = booking.GhiChu,
                ThoiGianDen = booking.ThoiGianDen,
                SoLuongPhong = 1 // Mặc định là 1 phòng
            };

            var datPhong = _datPhongRepo.CreateDatPhong(createDto);

            // Xác nhận thành công, xóa bản tạm
            _pendingBookings.Remove(bookingId);

            return Ok(new { message = "Xác nhận thành công, đã đặt phòng!", datPhong });
        }

        [HttpPut("{maDatPhong}")]
        [Authorize]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult UpdateDatPhong(string maDatPhong, [FromForm] UpdateDatPhongDTO updateDatPhong)
        {
            var datPhong = _datPhongRepo.UpdateDatPhong(maDatPhong, updateDatPhong);
            if (datPhong == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(datPhong);
        }

        [HttpDelete("{maDatPhong}")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult DeleteDatPhong(string maDatPhong)
        {
            var result = _datPhongRepo.DeleteDatPhong(maDatPhong);
            if (result == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(result);
        }

        [HttpPut("{maDatPhong}/trangthai")]
        [Authorize]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult UpdateTrangThai(string maDatPhong, [FromBody] UpdateTrangThaiDTO trangThaiDto)
        {
            var result = _datPhongRepo.UpdateTrangThai(maDatPhong, trangThaiDto.TrangThai);
            if (result == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(result);
        }

        [HttpGet("KhachHang")]
        [Authorize]
        [RequireRole("R00", "R01", "R02", "R04")]
        public async Task<IActionResult> GetDatPhongByKhachHang()
        {
            var maKh = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(maKh))
            {
                return Unauthorized("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
            }

            var datPhongs = await _datPhongRepo.GetDatPhongByKhachHang(maKh);
            return Ok(datPhongs);
        }
    }
}
