using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
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

        public DatPhongController(IDatPhongRepository datPhongRepo)
        {
            _datPhongRepo = datPhongRepo;
        }   

        // Lấy tất cả danh sách đặt phòng
        [HttpGet]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetAll()
        {
            var datPhongs = _datPhongRepo.GetAll();
            if (datPhongs == null || datPhongs.Count == 0)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng nào.");
            }
            return Ok(datPhongs);
        }
        // Tìm đặt phòng theo ID
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
        // Tạo đặt phòng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public IActionResult CreateDatPhong([FromForm] CreateDatPhongDTO createDatPhong)
        {
            var datPhong = _datPhongRepo.CreateDatPhong(createDatPhong);
            if (datPhong == null)
            {
                return BadRequest("Không thể tạo thông tin đặt phòng mới.");
            }
            return Ok(datPhong);
        }
        // Cập nhật đặt phòng
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
        // Xóa đặt phòng
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
        // Cập nhật trạng thái đặt phòng
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

        // Lấy lịch sử đặt phòng của khách hàng hiện tại
        [HttpGet("KhachHang")] // Route sẽ là /api/DatPhong/KhachHang
        [RequireRole("R04")] // Chỉ cho phép Khách hàng (R04) truy cập
        public async Task<IActionResult> GetDatPhongByKhachHang()
        {
            var maKh = User.FindFirstValue(ClaimTypes.NameIdentifier); // Lấy MaKh từ token (đảm bảo token chứa claim này, thường là sub hoặc nameid)

            if (string.IsNullOrEmpty(maKh))
            {
                // Điều này không nên xảy ra nếu [Authorize] và [RequireRole("R04")] hoạt động đúng
                // và token được cấu hình để chứa ID người dùng.
                return Unauthorized("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
            }

            // Giả định bạn có một phương thức GetDatPhongByMaKhAsync trong IDatPhongRepository
            // và đã implement nó.
            var datPhongs = await _datPhongRepo.GetDatPhongByKhachHang(maKh); 

            if (datPhongs == null || !datPhongs.Any())
            {
                // Trả về mảng rỗng nếu không có đặt phòng nào, thay vì NotFound,
                // để frontend dễ xử lý hơn (kiểm tra length của mảng).
                // Hoặc bạn có thể trả về NotFound tùy theo yêu cầu của frontend.
                return Ok(new List<object>()); 
            }
            return Ok(datPhongs);
        }
    }
}