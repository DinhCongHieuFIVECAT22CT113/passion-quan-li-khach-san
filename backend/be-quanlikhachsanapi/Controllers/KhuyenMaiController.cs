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
    public class KhuyenMaiController: ControllerBase
    {
        private readonly IKhuyenMaiRepository _khuyenMaiRepo;

        public KhuyenMaiController(IKhuyenMaiRepository khuyenMaiRepo)
        {
            _khuyenMaiRepo = khuyenMaiRepo;
        }

        // Lấy danh sách tất cả khuyến mãi
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll()
        {
            var khuyenMais = _khuyenMaiRepo.GetAll();
            if (khuyenMais == null || khuyenMais.Count == 0)
            {
                return NotFound("Không tìm thấy khuyến mãi nào.");
            }
            return Ok(khuyenMais);
        }
        // Lấy khuyến mãi theo ID
        [HttpGet("{maKhuyenMai}")]
        [AllowAnonymous]
        public IActionResult GetByID(string maKhuyenMai)
        {
            var khuyenMai = _khuyenMaiRepo.GetKhuyenMaiById(maKhuyenMai);
            if (khuyenMai == null)
            {
                return NotFound("Không tìm thấy khuyến mãi với ID đã nhập.");
            }
            return Ok(khuyenMai);
        }
        // Tạo mã khuyến mãi mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult CreateKhuyenMai([FromForm] CreateKhuyenMaiDTO createKhuyenMai)
        {
            var khuyenMai = _khuyenMaiRepo.CreateKhuyenMai(createKhuyenMai);
            if (khuyenMai == null)
            {
                return BadRequest("Không thể tạo khuyến mãi mới.");
            }
            return Ok(khuyenMai);
        }
        // Cập nhật mã khuyến mãi
        [HttpPut("{maKhuyenMai}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult UpdateKhuyenMai(string maKhuyenMai, [FromForm] UpdateKhuyenMaiDTO updateKhuyenMai)
        {
            var khuyenMai = _khuyenMaiRepo.UpdateKhuyenMai(maKhuyenMai, updateKhuyenMai);
            if (khuyenMai == null)
            {
                return NotFound("Không tìm thấy khuyến mãi với ID đã nhập.");
            }
            return Ok(khuyenMai);
        }
        // Cập nhật trạng thái mã khuyến mãi
        [HttpPut("{maKhuyenMai}/trangthai")]
        [Authorize]
        [RequireRole("R00", "R01")]
        public IActionResult UpdateTrangThai(string maKhuyenMai, [FromBody] UpdateTrangThaiDTO trangThaiDto)
        {
            var khuyenMai = _khuyenMaiRepo.UpdateTrangThai(maKhuyenMai, trangThaiDto.TrangThai);
            if (khuyenMai == null)
            {
                return NotFound("Không tìm thấy khuyến mãi để cập nhật.");
            }
            return Ok(khuyenMai);
        }
        // Xóa mã khuyến mãi
        [HttpDelete("{maKhuyenMai}")]
        [Authorize]
        [RequireRole("R00")]
        public IActionResult DeleteKhuyenMai(string maKhuyenMai)
        {
            var khuyenMai = _khuyenMaiRepo.DeleteKhuyenMai(maKhuyenMai);
            if (khuyenMai == null)
            {
                return NotFound("Không tìm thấy khuyến mãi với ID đã nhập.");
            }
            return Ok(khuyenMai);
        }
    }
}