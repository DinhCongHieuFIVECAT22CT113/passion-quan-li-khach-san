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

        // Lấy danh sách tất cả khách hàng
        [HttpGet]
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
        // Tìm khách hàng theo ID
        [HttpGet("{maKh}")]
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
        //Tao khách hàng mới
        [HttpPost]
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
        // Cập nhật khách hàng
        [HttpPut("{maKh}")]
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
        // Xóa khách hàng
        [HttpDelete("{maKh}")]
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
        // Cập nhật loại khách hàng
        [HttpPut("{maKh}/loaiKhachHang/{maLoaiKh}")]
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

        [HttpPost("{username}/upload-avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAvatar(string username, [FromForm] UploadAvatarDTO dto)
        {
            var result = await _khachHangRepo.UploadAvatarAsync(username, dto);
            return result;
        }

    }
}