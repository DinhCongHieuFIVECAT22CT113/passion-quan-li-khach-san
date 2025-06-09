using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhongController : ControllerBase
    {
        private readonly IPhongRepository _phongRepo;

        public PhongController(IPhongRepository phongRepo)
        {
            _phongRepo = phongRepo;
        }
        // Lấy danh sách tất cả phòng
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll()
        {
            var phongs = _phongRepo.GetAll();
            if (phongs == null || phongs.Count == 0)
            {
                return NotFound("Không tìm thấy phòng nào.");
            }
            return Ok(phongs);
        }
        // Lấy phòng theo ID
        [HttpGet("{maPhong}")]
        [AllowAnonymous]
        public IActionResult GetByID(string maPhong)
        {
            var result = _phongRepo.GetPhongById(maPhong);

            // Kiểm tra StatusCode từ JsonResult trả về bởi repository
            if (result.StatusCode == StatusCodes.Status404NotFound)
            {
                return NotFound(result.Value); // Trả về 404 với message từ repository
            }

            if (result.StatusCode == StatusCodes.Status200OK)
            {
                return Ok(result.Value); // Trả về 200 với dữ liệu phòng
            }
            
            // Trường hợp khác (ít khi xảy ra nếu repository được implement đúng)
            return StatusCode(result.StatusCode ?? 500, result.Value);
        }
        // Action mới để lấy phòng theo mã loại phòng
        [HttpGet("GetPhongByLoai/{maLoaiPhong}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<PhongDTO>>> GetPhongByMaLoaiPhong(string maLoaiPhong)
        {
            if (string.IsNullOrEmpty(maLoaiPhong))
            {
                return BadRequest("Mã loại phòng không được để trống.");
            }

            try
            {
                var phongs = await _phongRepo.GetPhongByMaLoaiPhongAsync(maLoaiPhong);

                // Repository đã trả về List<PhongDTO>, có thể rỗng nếu không tìm thấy.
                // Frontend sẽ xử lý việc hiển thị "Không có phòng nào" nếu danh sách rỗng.
                return Ok(phongs); 
            }
            catch (Exception ex)
            {
                // Log lỗi ở đây nếu cần (ví dụ: sử dụng ILogger)
                // _logger.LogError(ex, $"Lỗi khi lấy phòng theo loại {maLoaiPhong}");
                return StatusCode(500, $"Lỗi máy chủ nội bộ: {ex.Message}");
            }
        }
        // Tao phòng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public async Task<IActionResult> CreatePhong([FromForm] CreatePhongDTO createPhong)
        {
            var result = await _phongRepo.CreatePhong(createPhong);
            
            if (result.StatusCode == StatusCodes.Status201Created)
            {
                return Ok(result.Value);
            }
            else if (result.StatusCode == StatusCodes.Status500InternalServerError)
            {
                return StatusCode(500, result.Value);
            }
            
            return BadRequest("Không thể tạo phòng mới.");
        }
        // Cập nhật phòng
        [HttpPut("{maPhong}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public async Task<IActionResult> UpdatePhong(string maPhong, [FromForm] UpdatePhongDTO updatePhong)
        {
            var result = await _phongRepo.UpdatePhong(maPhong, updatePhong);
            
            if (result.StatusCode == StatusCodes.Status404NotFound)
            {
                return NotFound(result.Value);
            }
            else if (result.StatusCode == StatusCodes.Status200OK)
            {
                return Ok(result.Value);
            }
            else if (result.StatusCode == StatusCodes.Status500InternalServerError)
            {
                return StatusCode(500, result.Value);
            }
            
            return StatusCode(result.StatusCode ?? 500, result.Value);
        }
        // Cập nhật trạng thái phòng
        [HttpPut("{maPhong}/trangThai")]
        [Authorize]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult UpdateTrangThai(string maPhong, [FromBody] UpdateTrangThaiPhongDTO dto)
        {
            var phong = _phongRepo.UpdateTrangThai(maPhong, dto.TrangThai);
            if (phong == null)
            {
                return NotFound("Không tìm thấy phòng để cập nhật trạng thái.");
            }
            return Ok(phong);
        }
        // Xóa phòng
        [HttpDelete("{maPhong}")]
        [Authorize]
        [RequireRole("R00")]
        public IActionResult DeletePhong(string maPhong)
        {
            var phong = _phongRepo.DeletePhong(maPhong);
            if (phong == null)
            {
                return NotFound("Không tìm thấy phòng để xóa.");
            }
            return Ok(phong);
        }
    }
}