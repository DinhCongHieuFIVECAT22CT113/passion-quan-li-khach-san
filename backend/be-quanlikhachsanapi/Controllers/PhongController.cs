using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("Lấy danh sách tất cả phòng")]
        public IActionResult GetAll()
        {
            var phongs = _phongRepo.GetAll();
            if (phongs == null || phongs.Count == 0)
            {
                return NotFound("Không tìm thấy phòng nào.");
            }
            return Ok(phongs);
        }

        [HttpGet("Tìm phòng theo ID")]
        public IActionResult GetByID(string maPhong)
        {
            var phong = _phongRepo.GetPhongById(maPhong);
            if (phong == null)
            {
                return NotFound("Không tìm thấy phòng với ID đã cho.");
            }
            return Ok(phong);
        }

        [HttpPost("Tạo phòng mới")]
        [Consumes("multipart/form-data")]
        public IActionResult CreatePhong([FromForm] CreatePhongDTO createPhong)
        {
            var phong = _phongRepo.CreatePhong(createPhong);
            if (phong == null)
            {
                return BadRequest("Không thể tạo phòng mới.");
            }
            return Ok(phong);
        }
        
        [HttpPut("Cập nhật phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdatePhong(string maPhong, [FromForm] UpdatePhongDTO updatePhong)
        {
            var phong = _phongRepo.UpdatePhong(maPhong, updatePhong);
            if (phong == null)
            {
                return NotFound("Không tìm thấy phòng để cập nhật.");
            }
            return Ok(phong);
        }

        [HttpPut("Cập nhật trạng thái phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateTrangThai(string maPhong, string trangThai)
        {
            var phong = _phongRepo.UpdateTrangThai(maPhong, trangThai);
            if (phong == null)
            {
                return NotFound("Không tìm thấy phòng để cập nhật trạng thái.");
            }
            return Ok(phong);
        }

        [HttpDelete("Xóa phòng")]
        [Consumes("multipart/form-data")]
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