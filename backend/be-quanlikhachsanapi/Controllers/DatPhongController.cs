using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using be_quanlikhachsanapi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Security.Claims;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DatPhongController : ControllerBase
    {
        private readonly IDatPhongRepository _datPhongRepo;

        // Tạm lưu booking chưa xác nhận (bạn nên chuyển sang cache hoặc DB)
        private static readonly Dictionary<string, PendingGuestBooking> _pendingBookings = new();

        public DatPhongController(IDatPhongRepository datPhongRepo)
        {
            _datPhongRepo = datPhongRepo;
        }

        [HttpGet]
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

            // TODO: Gửi email với mã xác nhận booking.MaXacNhan đến booking.Email
            Console.WriteLine($"Mã xác nhận cho booking {booking.Id}: {booking.MaXacNhan}");

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

            // TODO: Kiểm tra booking.Email có tồn tại trong bảng KhachHang hay không
            // Giả sử bạn có method _datPhongRepo.CreateDatPhongForGuest(email, ...)

            // Tạo một khách hàng mới hoặc lấy mã khách hàng hiện có
            // TODO: Thay thế bằng logic thực tế để tìm hoặc tạo khách hàng
            string maKhachHang = "KH001"; // Giả sử đây là mã khách hàng mặc định hoặc đã tìm được
            
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
