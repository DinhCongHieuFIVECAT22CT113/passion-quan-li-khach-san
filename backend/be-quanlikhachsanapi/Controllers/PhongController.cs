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
            var phong = _phongRepo.GetPhongById(maPhong);
            if (phong == null)
            {
                return NotFound("Không tìm thấy phòng với ID đã cho.");
            }
            return Ok(phong);
        }
        // Tao phòng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult CreatePhong([FromForm] CreatePhongDTO createPhong)
        {
            var phong = _phongRepo.CreatePhong(createPhong);
            if (phong == null)
            {
                return BadRequest("Không thể tạo phòng mới.");
            }
            return Ok(phong);
        }
        // Cập nhật phòng
        [HttpPut("{maPhong}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult UpdatePhong(string maPhong, [FromForm] UpdatePhongDTO updatePhong)
        {
            var phong = _phongRepo.UpdatePhong(maPhong, updatePhong);
            if (phong == null)
            {
                return NotFound("Không tìm thấy phòng để cập nhật.");
            }
            return Ok(phong);
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