using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("Lấy danh sách tất cả loại phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var loaiPhongs = _loaiPhongRepo.GetAll();
            if (loaiPhongs == null || loaiPhongs.Count == 0)
            {
                return NotFound("Không tìm thấy loại phòng nào.");
            }
            return Ok(loaiPhongs);
        }

        [HttpGet("Tìm loại phòng theo ID")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maLoaiPhong)
        {
            var loaiPhong = _loaiPhongRepo.GetLoaiPhongById(maLoaiPhong);
            if (loaiPhong == null)
            {
                return NotFound("Không tìm thấy loại phòng với ID đã cho.");
            }
            return Ok(loaiPhong);
        }

        [HttpPost("Tạo loại phòng mới")]
        [Consumes("multipart/form-data")]
        public IActionResult CreateLoaiPhong([FromForm] CreateLoaiPhongDTO createLoaiPhong)
        {
            var loaiPhong = _loaiPhongRepo.CreateLoaiPhong(createLoaiPhong);
            if (loaiPhong == null)
            {
                return BadRequest("Không thể tạo loại phòng mới.");
            }
            return Ok(loaiPhong);
        }

        [HttpPut("Cập nhật loại phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateLoaiPhong(string maLoaiPhong, [FromForm] UpdateLoaiPhongDTO updateLoaiPhong)
        {
            var loaiPhong = _loaiPhongRepo.UpdateLoaiPhong(maLoaiPhong, updateLoaiPhong);
            if (loaiPhong == null)
            {
                return NotFound("Không tìm thấy loại phòng với ID đã cho.");
            }
            return Ok(loaiPhong);
        }

        [HttpDelete("Xóa loại phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteLoaiPhong(string maLoaiPhong)
        {
            var result = _loaiPhongRepo.DeleteLoaiPhong(maLoaiPhong);
            if (result == null)
            {
                return NotFound("Không tìm thấy loại phòng với ID đã cho.");
            }   
            return Ok(result);
        }
    }
}