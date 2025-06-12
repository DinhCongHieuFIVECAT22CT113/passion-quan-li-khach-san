using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using be_quanlikhachsanapi.Models;
using be_quanlikhachsanapi.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;

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
        private readonly IMemoryCache _cache;

        // Tạm lưu booking chưa xác nhận (bạn nên chuyển sang cache hoặc DB)
        private static readonly Dictionary<string, PendingGuestBooking> _pendingBookings = new();

        public DatPhongController(
            IDatPhongRepository datPhongRepo,
            ISendEmailServices sendEmail,
            DataQlks113Nhom2Context context,
            INotificationService notificationService,
            IMemoryCache cache)
        {
            _datPhongRepo = datPhongRepo;
            _sendEmail = sendEmail;
            _context = context;
            _notificationService = notificationService;
            _cache = cache;
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

        // ✅ API đặt phòng trực tiếp cho khách vãng lai (không cần xác nhận email)
        [HttpPost("Guest")]
        [AllowAnonymous]
        [Consumes("multipart/form-data")]
        public IActionResult CreateGuestBooking([FromForm] CreateGuestBookingDTO createGuestBooking)
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

                // Tạo hoặc tìm khách hàng dựa trên email/số điện thoại
                var khachHang = _context.KhachHangs.FirstOrDefault(kh =>
                    kh.Email == createGuestBooking.Email || kh.Sdt == createGuestBooking.SoDienThoai);

                string maKhachHang;
                if (khachHang == null)
                {
                    // Tạo khách hàng mới cho khách vãng lai
                    var lastKhachHang = _context.KhachHangs
                        .OrderByDescending(kh => kh.MaKh)
                        .FirstOrDefault();

                    int nextNumber = 1;
                    if (lastKhachHang != null && lastKhachHang.MaKh.StartsWith("KH"))
                    {
                        if (int.TryParse(lastKhachHang.MaKh.Substring(2), out int currentNumber))
                        {
                            nextNumber = currentNumber + 1;
                        }
                    }

                    maKhachHang = $"KH{nextNumber:D3}";

                    // Tách họ và tên từ họ tên đầy đủ
                    var hoTenParts = createGuestBooking.HoTen.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    var ho = hoTenParts.Length > 0 ? hoTenParts[0] : "";
                    var ten = hoTenParts.Length > 1 ? string.Join(" ", hoTenParts.Skip(1)) : "";

                    var newKhachHang = new KhachHang
                    {
                        MaKh = maKhachHang,
                        UserName = createGuestBooking.Email,
                        PasswordHash = "GuestUser123", // Mật khẩu mặc định cho khách vãng lai
                        HoKh = ho,
                        TenKh = ten,
                        Email = createGuestBooking.Email,
                        Sdt = createGuestBooking.SoDienThoai,
                        SoCccd = "000000000000", // CCCD mặc định
                        MaLoaiKh = "LKH001", // Loại khách hàng thường
                        NgayTao = DateTime.Now,
                        NgaySua = DateTime.Now
                    };

                    _context.KhachHangs.Add(newKhachHang);
                    _context.SaveChanges();
                }
                else
                {
                    maKhachHang = khachHang.MaKh;
                }

                // Tạo DTO để đặt phòng
                var createDatPhong = new CreateDatPhongDTO
                {
                    MaKH = maKhachHang,
                    MaPhong = createGuestBooking.MaPhong,
                    NgayNhanPhong = createGuestBooking.NgayNhanPhong,
                    NgayTraPhong = createGuestBooking.NgayTraPhong,
                    TreEm = createGuestBooking.SoTreEm,
                    NguoiLon = createGuestBooking.SoNguoiLon,
                    GhiChu = createGuestBooking.GhiChu ?? "Đặt phòng khách vãng lai",
                    SoLuongPhong = 1,
                    ThoiGianDen = createGuestBooking.ThoiGianDen ?? "14:00"
                };

                var result = _datPhongRepo.CreateDatPhong(createDatPhong);
                return result;
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi đặt phòng: {ex.Message}" });
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
                
                // Tách họ và tên từ họ tên đầy đủ
                var hoTenParts = booking.HoTen.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var ho = hoTenParts.Length > 0 ? hoTenParts[0] : "";
                var ten = hoTenParts.Length > 1 ? string.Join(" ", hoTenParts.Skip(1)) : "";

                // Tạo khách hàng mới
                var newKhachHang = new KhachHang
                {
                    MaKh = newMaKhachHang,
                    UserName = booking.Email,
                    PasswordHash = "GuestUser123", // Mật khẩu mặc định cho khách vãng lai
                    HoKh = ho,
                    TenKh = ten,
                    Email = booking.Email,
                    Sdt = booking.SoDienThoai,
                    SoCccd = "000000000000", // CCCD mặc định
                    MaLoaiKh = "LKH001", // Loại khách hàng thường
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

            Console.WriteLine($"🔍 Lấy đặt phòng cho khách hàng: {maKh}");

            // Lấy đặt phòng với thông tin chi tiết phòng và loại phòng
            var datPhongs = await _context.DatPhongs
                .Where(dp => dp.MaKh == maKh)
                .Include(dp => dp.ChiTietDatPhongs)
                    .ThenInclude(ct => ct.MaPhongNavigation)
                    .ThenInclude(p => p.MaLoaiPhongNavigation)
                .Include(dp => dp.HoaDons)
                .OrderByDescending(dp => dp.NgayTao)
                .ToListAsync();

            Console.WriteLine($"📊 Tìm thấy {datPhongs.Count} đặt phòng cho khách hàng {maKh}");

            // Chuyển đổi sang DTO với thông tin đầy đủ
            var datPhongDtos = datPhongs.Select(dp => {
                var chiTietDatPhong = dp.ChiTietDatPhongs.FirstOrDefault();
                var phong = chiTietDatPhong?.MaPhongNavigation;
                var loaiPhong = phong?.MaLoaiPhongNavigation;
                var hoaDon = dp.HoaDons.FirstOrDefault();

                return new
                {
                    maDatPhong = dp.MaDatPhong,
                    maKh = dp.MaKh,
                    treEm = dp.TreEm,
                    nguoiLon = dp.NguoiLon,
                    ghiChu = dp.GhiChu,
                    soLuongPhong = dp.SoLuongPhong,
                    thoiGianDen = dp.ThoiGianDen,
                    ngayNhanPhong = dp.NgayNhanPhong,
                    ngayTraPhong = dp.NgayTraPhong,
                    trangThai = dp.TrangThai,
                    ngayTao = dp.NgayTao,
                    ngaySua = dp.NgaySua,

                    // Thông tin phòng
                    maPhong = phong?.MaPhong,
                    tenPhong = phong?.TenPhong ?? "Phòng không xác định",

                    // Thông tin loại phòng
                    maLoaiPhong = loaiPhong?.MaLoaiPhong,
                    tenLoaiPhong = loaiPhong?.TenLoaiPhong ?? "Loại phòng không xác định",
                    giaMoiDem = loaiPhong?.GiaMoiDem ?? 0,

                    // Thông tin hóa đơn
                    tongTien = hoaDon?.TongTien ?? 0,
                    trangThaiThanhToan = hoaDon?.TrangThai ?? "Chưa thanh toán"
                };
            }).ToList();

            Console.WriteLine($"✅ Trả về {datPhongDtos.Count} đặt phòng với thông tin đầy đủ");

            return Ok(datPhongDtos);
        }
    }
}
