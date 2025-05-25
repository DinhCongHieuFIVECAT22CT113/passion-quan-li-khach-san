using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoaiPhongController : ControllerBase
    {
        private readonly ILoaiPhongRepository _loaiPhongRepo;

        public LoaiPhongController(ILoaiPhongRepository loaiPhongRepo)
        {
            _loaiPhongRepo = loaiPhongRepo;
        }
        // Lấy danh sách tất cả loại phòng
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll()
        {
            var loaiPhongs = _loaiPhongRepo.GetAll();
            if (loaiPhongs == null || loaiPhongs.Count == 0)
            {
                return NotFound("Không tìm thấy loại phòng nào.");
            }
            return Ok(loaiPhongs);
        }
        // Lấy loại phòng theo ID
        [HttpGet("{maLoaiPhong}")]
        [AllowAnonymous]
        public IActionResult GetByID(string maLoaiPhong)
        {
            var loaiPhong = _loaiPhongRepo.GetLoaiPhongById(maLoaiPhong);
            if (loaiPhong == null)
            {
                return NotFound("Không tìm thấy loại phòng với ID đã cho.");
            }
            return Ok(loaiPhong);
        }
        // Tạo loại phòng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult CreateLoaiPhong([FromForm] CreateLoaiPhongDTO createLoaiPhong)
        {
            var loaiPhong = _loaiPhongRepo.CreateLoaiPhong(createLoaiPhong);
            if (loaiPhong == null)
            {
                return BadRequest("Không thể tạo loại phòng mới.");
            }
            return Ok(loaiPhong);
        }
        // Cập nhật loại phòng
        [HttpPut("{maLoaiPhong}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult UpdateLoaiPhong(string maLoaiPhong, [FromForm] UpdateLoaiPhongDTO updateLoaiPhong)
        {
            var loaiPhong = _loaiPhongRepo.UpdateLoaiPhong(maLoaiPhong, updateLoaiPhong);
            if (loaiPhong == null)
            {
                return NotFound("Không tìm thấy loại phòng với ID đã cho.");
            }
            return Ok(loaiPhong);
        }
        // Xóa loại phòng
        [HttpDelete("{maLoaiPhong}")]
        [Authorize]
        [RequireRole("R00")]
        public IActionResult DeleteLoaiPhong(string maLoaiPhong)
        {
            var result = _loaiPhongRepo.DeleteLoaiPhong(maLoaiPhong);
            if (result == null)
            {
                return NotFound("Không tìm thấy loại phòng với ID đã cho hoặc không thể xóa.");
            }   
            return Ok(result);
        }
    }
}