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
    [Authorize]
    public class LoaiKhachHangController : ControllerBase
    {
        private readonly ILoaiKhachHangRepository _loaiKhachHangRepo;

        public LoaiKhachHangController(ILoaiKhachHangRepository loaiKhachHangRepo)
        {
            _loaiKhachHangRepo = loaiKhachHangRepo;
        }
        // Lấy danh sách tất cả loại khách hàng
        [HttpGet]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetAll()
        {
            var loaiKhachHangs = _loaiKhachHangRepo.GetAll();
            if (loaiKhachHangs == null || loaiKhachHangs.Count == 0)
            {
                return NotFound("Không tìm thấy loại khách hàng nào.");
            }
            return Ok(loaiKhachHangs);
        }
        // Lấy loại khách hàng theo ID
        [HttpGet("{maLoaiKh}")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetByID(string maLoaiKh)
        {
            var loaiKhachHang = _loaiKhachHangRepo.GetLoaiKhachHangById(maLoaiKh);
            if (loaiKhachHang == null)
            {
                return NotFound("Không tìm thấy loại khách hàng với ID đã cho.");
            }
            return Ok(loaiKhachHang);
        }
        // Tạo loại khách hàng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00")]
        public IActionResult CreateLoaiKhachHang([FromForm] CreateLoaiKhachHangDto createLoaiKhachHang)
        {
            var loaiKhachHang = _loaiKhachHangRepo.CreateLoaiKhachHang(createLoaiKhachHang);
            if (loaiKhachHang == null)
            {
                return BadRequest("Không thể tạo loại khách hàng mới.");
            }
            return Ok(loaiKhachHang);
        }
        // Cập nhật loại khách hàng
        [HttpPut("{maLoaiKh}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00")]
        public IActionResult UpdateLoaiKhachHang(string maLoaiKh, [FromForm] UpdateLoaiKhachHangDto updateLoaiKhachHang)
        {
            var loaiKhachHang = _loaiKhachHangRepo.UpdateLoaiKhachHang(maLoaiKh, updateLoaiKhachHang);
            if (loaiKhachHang == null)
            {
                return NotFound("Không tìm thấy loại khách hàng với ID đã cho.");
            }
            return Ok(loaiKhachHang);
        }
        // Xóa loại khách hàng
        [HttpDelete("{maLoaiKh}")]
        [RequireRole("R00")]
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
