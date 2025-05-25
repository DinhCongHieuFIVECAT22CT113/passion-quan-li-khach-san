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
    public class CaLamViecController : ControllerBase
    {
        private readonly ICaLamViecRepository _caLamViecRepo;

        public CaLamViecController(ICaLamViecRepository caLamViecRepo)
        {
            _caLamViecRepo = caLamViecRepo;
        }

        // Lấy danh sách tất cả ca làm việc
        [HttpGet()]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetAll()
        {
            var caLamViecs = _caLamViecRepo.GetAll();
            if (caLamViecs == null || caLamViecs.Count == 0)
            {
                return NotFound("Không tìm thấy ca làm việc nào.");
            }
            return Ok(caLamViecs);
        }
        // Tìm ca làm việc theo ID
        [HttpGet("{maCaLam}")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetByID(string maCaLam)
        {
            var caLamViec = _caLamViecRepo.GetCaLamViecById(maCaLam);
            if (caLamViec == null)
            {
                return NotFound("Không tìm thấy ca làm việc với ID đã cho.");
            }
            return Ok(caLamViec);
        }
        //Tao ca làm việc mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01")]
        public IActionResult CreateCaLamViec([FromForm] CreateCaLamViecDTO createCaLamViec)
        {
            var caLamViec = _caLamViecRepo.CreateCaLamViec(createCaLamViec);
            if (caLamViec == null)
            {
                return BadRequest("Không thể tạo ca làm việc mới.");
            }
            return Ok(caLamViec);
        }
        // Cập nhật ca làm việc
        [HttpPut("{maCaLam}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01")]
        public IActionResult UpdateCaLamViec(string maCaLam, [FromForm] UpdateCaLamViecDTO updateCaLamViec)
        {
            var caLamViec = _caLamViecRepo.UpdateCaLamViec(maCaLam, updateCaLamViec);
            if (caLamViec == null)
            {
                return NotFound("Không tìm thấy ca làm việc với ID đã cho.");
            }
            return Ok(caLamViec);
        }
        // Xóa ca làm việc
        [HttpDelete("{maCaLam}")]
        [RequireRole("R00")]
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