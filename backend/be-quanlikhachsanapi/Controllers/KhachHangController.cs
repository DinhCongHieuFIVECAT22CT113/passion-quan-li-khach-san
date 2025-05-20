using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhachHangController : ControllerBase
    {
        private readonly IKhachHangRepository _khachHangRepo;

        public KhachHangController(IKhachHangRepository khachHangRepo)
        {
            _khachHangRepo = khachHangRepo;
        }

        [HttpGet("Lấy danh sách tất cả khách hàng")]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var khachHangs = _khachHangRepo.GetAll();
            if (khachHangs == null || khachHangs.Count == 0)
            {
                return NotFound("Không tìm thấy khách hàng nào.");
            }
            return Ok(khachHangs);
        }

        [HttpGet("Tìm khách hàng theo ID")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maKh)
        {
            var khachHang = _khachHangRepo.GetKhachHangById(maKh);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        }

        [HttpPost("Tạo khách hàng mới")]
        [Consumes("multipart/form-data")]
        public IActionResult CreateKhachHang([FromForm] CreateKhachHangDto createKhachHang)
        {
            var khachHang = _khachHangRepo.CreateKhachHang(createKhachHang);
            if (khachHang == null)
            {
                return BadRequest("Không thể tạo khách hàng mới.");
            }
            return Ok(khachHang);
        }

        [HttpPut("Cập nhật khách hàng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateKhachHang(string maKh, [FromForm] UpdateKhachHangDto updateKhachHang)
        {
            var khachHang = _khachHangRepo.UpdateKhachHang(maKh, updateKhachHang);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        }

        [HttpDelete("Xóa khách hàng")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteKhachHang(string maKh)
        {
            var khachHang = _khachHangRepo.DeleteKhachHang(maKh);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        }
        [HttpPut("Cập nhật loại khách hàng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateLoaiKhachHang(string maKh, string maLoaiKh)
        {
            var khachHang = _khachHangRepo.UpdateLoaiKhachHang(maKh, maLoaiKh);
            if (khachHang == null)
            {
                return NotFound("Không tìm thấy khách hàng với ID đã cho.");
            }
            return Ok(khachHang);
        } 
    }
}