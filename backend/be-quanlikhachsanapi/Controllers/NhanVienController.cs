using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NhanVienController : ControllerBase
    {
        private readonly INhanVienRepository _nhanVienRepo;

        public NhanVienController(INhanVienRepository nhanVienRepo)
        {
            _nhanVienRepo = nhanVienRepo;
        }
        // Lấy danh sách tất cả nhân viên
        [HttpGet]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var nhanViens = _nhanVienRepo.GetAll();
            if (nhanViens == null || nhanViens.Count == 0)
            {
                return NotFound("Không tìm thấy nhân viên nào.");
            }
            return Ok(nhanViens);
        }
        // Lấy nhân viên theo ID
        [HttpGet("{maNv}")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maNv)
        {
            var nhanVien = _nhanVienRepo.GetNhanVienById(maNv);
            if (nhanVien == null)
            {
                return NotFound("Không tìm thấy nhân viên với ID đã cho.");
            }
            return Ok(nhanVien);
        }
        // Tạo nhân viên mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        public IActionResult CreateNhanVien([FromForm] CreateNhanVienDTO createNhanVien)
        {
            var nhanVien = _nhanVienRepo.CreateNhanVien(createNhanVien);
            if (nhanVien == null)
            {
                return BadRequest("Không thể tạo nhân viên mới.");
            }
            return Ok(nhanVien);
        }
        // Cập nhật nhân viên
        [HttpPut("{maNv}")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateNhanVien(string maNv, [FromForm] UpdateNhanVienDTO updateNhanVien)
        {
            var nhanVien = _nhanVienRepo.UpdateNhanVien(maNv, updateNhanVien);
            if (nhanVien == null)
            {
                return NotFound("Không tìm thấy nhân viên với ID đã cho.");
            }
            return Ok(nhanVien);
        }
        // Xóa nhân viên
        [HttpDelete("{maNv}")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteNhanVien(string maNv)
        {
            var nhanVien = _nhanVienRepo.DeleteNhanVien(maNv);
            if (nhanVien == null)
            {
                return NotFound("Không tìm thấy nhân viên với ID đã cho.");
            }
            return Ok(nhanVien);
        }
    }
}