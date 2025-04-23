using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CaLamViecController : ControllerBase
    {
        private readonly ICaLamViecRepository _caLamViecRepo;

        public CaLamViecController(ICaLamViecRepository caLamViecRepo)
        {
            _caLamViecRepo = caLamViecRepo;
        }

        [HttpGet("Lấy danh sách tất cả ca làm việc")]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var caLamViecs = _caLamViecRepo.GetAll();
            if (caLamViecs == null || caLamViecs.Count == 0)
            {
                return NotFound("Không tìm thấy ca làm việc nào.");
            }
            return Ok(caLamViecs);
        }
        [HttpGet("Tìm ca làm việc theo ID")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maCaLam)
        {
            var caLamViec = _caLamViecRepo.GetCaLamViecById(maCaLam);
            if (caLamViec == null)
            {
                return NotFound("Không tìm thấy ca làm việc với ID đã cho.");
            }
            return Ok(caLamViec);
        }
        [HttpPost("Tạo ca làm việc mới")]
        [Consumes("multipart/form-data")]
        public IActionResult CreateCaLamViec([FromForm] CreateCaLamViecDTO createCaLamViec)
        {
            var caLamViec = _caLamViecRepo.CreateCaLamViec(createCaLamViec);
            if (caLamViec == null)
            {
                return BadRequest("Không thể tạo ca làm việc mới.");
            }
            return Ok(caLamViec);
        }
        [HttpPut("Cập nhật ca làm việc")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateCaLamViec(string maCaLam, [FromForm] UpdateCaLamViecDTO updateCaLamViec)
        {
            var caLamViec = _caLamViecRepo.UpdateCaLamViec(maCaLam, updateCaLamViec);
            if (caLamViec == null)
            {
                return NotFound("Không tìm thấy ca làm việc với ID đã cho.");
            }
            return Ok(caLamViec);
        }
        [HttpDelete("Xóa ca làm việc")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteCaLamViec(string maCaLam)
        {
            var caLamViec = _caLamViecRepo.DeleteCaLamViec(maCaLam);
            if (caLamViec == null)
            {
                return NotFound("Không tìm thấy ca làm việc với ID đã cho.");
            }
            return Ok(caLamViec);
        }
    }
}