using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoaiKhachHangController : ControllerBase
    {
        private readonly ILoaiKhachHangRepository _loaiKhachHangRepo;

        public LoaiKhachHangController(ILoaiKhachHangRepository loaiKhachHangRepo)
        {
            _loaiKhachHangRepo = loaiKhachHangRepo;
        }

        [HttpGet("Lấy danh sách tất cả loại khách hàng")]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var loaiKhachHangs = _loaiKhachHangRepo.GetAll();
            if (loaiKhachHangs == null || loaiKhachHangs.Count == 0)
            {
                return NotFound("Không tìm thấy loại khách hàng nào.");
            }
            return Ok(loaiKhachHangs);
        }
        [HttpGet("Tìm loại khách hàng theo ID")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maLoaiKh)
        {
            var loaiKhachHang = _loaiKhachHangRepo.GetLoaiKhachHangById(maLoaiKh);
            if (loaiKhachHang == null)
            {
                return NotFound("Không tìm thấy loại khách hàng với ID đã cho.");
            }
            return Ok(loaiKhachHang);
        }
        [HttpPost("Tạo loại khách hàng mới")]
        [Consumes("multipart/form-data")]
        public IActionResult CreateLoaiKhachHang([FromForm] CreateLoaiKhachHangDto createLoaiKhachHang)
        {
            var loaiKhachHang = _loaiKhachHangRepo.CreateLoaiKhachHang(createLoaiKhachHang);
            if (loaiKhachHang == null)
            {
                return BadRequest("Không thể tạo loại khách hàng mới.");
            }
            return Ok(loaiKhachHang);
        }
        [HttpPut("Cập nhật loại khách hàng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateLoaiKhachHang(string maLoaiKh, [FromForm] UpdateLoaiKhachHangDto updateLoaiKhachHang)
        {
            var loaiKhachHang = _loaiKhachHangRepo.UpdateLoaiKhachHang(maLoaiKh, updateLoaiKhachHang);
            if (loaiKhachHang == null)
            {
                return NotFound("Không tìm thấy loại khách hàng với ID đã cho.");
            }
            return Ok(loaiKhachHang);
        }
        [HttpDelete("Xóa loại khách hàng")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteLoaiKhachHang(string maLoaiKh)
        {
            var loaiKhachHang = _loaiKhachHangRepo.DeleteLoaiKhachHang(maLoaiKh);
            if (loaiKhachHang == null)
            {
                return NotFound("Không tìm thấy loại khách hàng với ID đã cho.");
            }
            return Ok(loaiKhachHang);
        }
    }
}
