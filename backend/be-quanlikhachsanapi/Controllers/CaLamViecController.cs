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

        // Lấy danh sách tất cả ca làm việc
        [HttpGet()]
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
        // Tìm ca làm việc theo ID
        [HttpGet("{maCaLam}")]
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
        //Tao ca làm việc mới
        [HttpPost]
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
        // Cập nhật ca làm việc
        [HttpPut("{maCaLam}")]
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
        // Xóa ca làm việc
        [HttpDelete("{maCaLam}")]
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