using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class KhachHangController : ControllerBase
    {
        private readonly IKhachHangRepository _khachHangRepo;

        public KhachHangController(IKhachHangRepository khachHangRepo)
        {
            _khachHangRepo = khachHangRepo;
        }        // Lấy danh sách tất cả khách hàng        
        [HttpGet]
        [RequireRole("R00", "R01", "R02", "R03")]  // Thêm R03 cho kế toán để xem thông tin khách hàng
        public IActionResult GetAll()
        {
            var khachHangs = _khachHangRepo.GetAll();
            if (khachHangs == null || khachHangs.Count == 0)
            {
                return NotFound("Không tìm thấy khách hàng nào.");
            }
            return Ok(khachHangs);
        }
        // Tìm khách hàng theo ID
        [HttpGet("{maKh}")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public IActionResult GetByID(string maKh)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserRole == "R04" && currentUserId != maKh)
            {
                return Forbid("Bạn chỉ có thể xem thông tin của chính mình.");
            }

            var khachHang = _khachHangRepo.GetKhachHangById(maKh);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        }
        //Tao khách hàng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult CreateKhachHang([FromForm] CreateKhachHangDto createKhachHang)
        {
            var khachHang = _khachHangRepo.CreateKhachHang(createKhachHang);
            if (khachHang == null)
            {
                return BadRequest("Không thể tạo khách hàng mới.");
            }
            return Ok(khachHang);
        }
        // Cập nhật khách hàng
        [HttpPut("{maKh}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public IActionResult UpdateKhachHang(string maKh, [FromForm] UpdateKhachHangDto updateKhachHang)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserRole == "R04" && currentUserId != maKh)
            {
                return Forbid("Bạn chỉ có thể cập nhật thông tin của chính mình.");
            }

            var khachHang = _khachHangRepo.UpdateKhachHang(maKh, updateKhachHang);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        }
        // Xóa khách hàng
        [HttpDelete("{maKh}")]
        [RequireRole("R00")]
        public IActionResult DeleteKhachHang(string maKh)
        {
            var khachHang = _khachHangRepo.DeleteKhachHang(maKh);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        }
        // Cập nhật loại khách hàng
        [HttpPut("{maKh}/loaiKhachHang/{maLoaiKh}")]
        [RequireRole("R00", "R01")]
        public IActionResult UpdateLoaiKhachHang(string maKh, string maLoaiKh)
        {
            var khachHang = _khachHangRepo.UpdateLoaiKhachHang(maKh, maLoaiKh);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        }

        [HttpPost("{username}/upload-avatar")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public async Task<IActionResult> UploadAvatar(string username, [FromForm] UploadAvatarDTO dto)
        {
            var result = await _khachHangRepo.UploadAvatarAsync(username, dto);
            return result;
        }
        
        [HttpPost("upload-avatar-by-id/{maKh}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public async Task<IActionResult> UploadAvatarById(string maKh, [FromForm] UploadAvatarDTO dto)
        {
            var result = await _khachHangRepo.UploadAvatarByIdAsync(maKh, dto);
            return result;
        }

        // Endpoint để lấy thông tin user hiện tại
        [HttpGet("me")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public IActionResult GetCurrentUser()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("Không thể xác định người dùng.");
            }

            var khachHang = _khachHangRepo.GetKhachHangById(currentUserId);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy thông tin người dùng.");
            }
            return Ok(khachHang);
        }

        // Endpoint để cập nhật thông tin cá nhân
        [HttpPut("cap-nhat-thong-tin")]
        [RequireRole("R00", "R01", "R02", "R04")]
        public IActionResult UpdatePersonalInfo([FromBody] UpdateKhachHangDto updateDto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("Không thể xác định người dùng.");
            }

            var result = _khachHangRepo.UpdateKhachHang(currentUserId, updateDto);
            return result;
        }

    }
}