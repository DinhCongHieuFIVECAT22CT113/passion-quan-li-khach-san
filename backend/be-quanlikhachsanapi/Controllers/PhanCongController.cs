using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Security.Claims;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PhanCongController : ControllerBase
    {
        private readonly IPhanCongCaRepository _phanCongCaRepo;

        public PhanCongController(IPhanCongCaRepository phanCongCaRepo)
        {
            _phanCongCaRepo = phanCongCaRepo;
        }
        // Phân công ca làm
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01")]
        public IActionResult GiaoCaLam([FromForm] CreatePhanCongDTO createPhanCongDto)
        {
            var result = _phanCongCaRepo.GiaoCaLam(createPhanCongDto);
            if (result.StatusCode == 400)
            {
                return BadRequest(result.Value);
            }
            if (result is ObjectResult okResult && okResult.StatusCode == 200)
            {
                return Ok(okResult.Value);
            }
            return StatusCode(result.StatusCode ?? 500, result.Value);
        }
        // Cập nhật ca làm
        [HttpPut("{maPhanCong}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01")]
        public IActionResult UpdateCaLam([FromForm] UpdatePhanCongDTO updatePhanCongDto)
        {
            var result = _phanCongCaRepo.UpdateCaLam(updatePhanCongDto);
            if (result.StatusCode == 400)
            {
                return BadRequest(result.Value);
            }
            if (result is ObjectResult okUpdResult && okUpdResult.StatusCode == 200)
            {
                return Ok(okUpdResult.Value);
            }
            return StatusCode(result.StatusCode ?? 500, result.Value);
        }
        // Lấy danh sách ca làm
        [HttpGet("nhanVien/{maNv}")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetLichLamViecByNhanVien(string maNv)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserRole == "R02" && currentUserId != maNv)
            {
                return Forbid("Nhân viên chỉ có thể xem lịch làm việc của chính mình.");
            }

            var result = _phanCongCaRepo.GetLichLamViecByNhanVien(maNv);
            if (result.StatusCode == 400)
            {
                return BadRequest(result.Value);
            }
            if (result is ObjectResult okGetResult && okGetResult.StatusCode == 200)
            {
                return Ok(okGetResult.Value);
            }
            return StatusCode(result.StatusCode ?? 500, result.Value);
        }
    }
}