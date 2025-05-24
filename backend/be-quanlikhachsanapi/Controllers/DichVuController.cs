using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DichVuController : ControllerBase
    {
        private readonly IDichVuRepository _dichVuRepo;

        public DichVuController(IDichVuRepository dichVuRepo)
        {
            _dichVuRepo = dichVuRepo;
        }

        // Lấy danh sách tất cả dịch vụ
        [HttpGet]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var dichVus = _dichVuRepo.GetAll();
            if (dichVus == null || dichVus.Count == 0)
            {
                return NotFound("Không tìm thấy dịch vụ nào.");
            }
            return Ok(dichVus);
        }
        // Lấy dịch vụ theo ID
        [HttpGet("{maDichVu}")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maDichVu)
        {
            var dichVu = _dichVuRepo.GetDichVuById(maDichVu);
            if (dichVu == null)
            {
                return NotFound("Không tìm thấy dịch vụ với ID đã cho.");
            }
            return Ok(dichVu);
        }
        // Tạo dịch vụ mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        public IActionResult CreateDichVu([FromForm] CreateDichVuDTO createDichVu)
        {
            var dichVu = _dichVuRepo.CreateDichVu(createDichVu);
            if (dichVu == null)
            {
                return BadRequest("Không thể tạo dịch vụ mới.");
            }
            return Ok(dichVu);
        }
        // Cập nhật dịch vụ
        [HttpPut("{maDichVu}")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateDichVu(string maDichVu, [FromForm] UpdateDichVuDTO updateDichVu)
        {
            var dichVu = _dichVuRepo.UpdateDichVu(maDichVu, updateDichVu);
            if (dichVu == null)
            {
                return NotFound("Không tìm thấy dịch vụ với ID đã cho.");
            }
            return Ok(dichVu);
        }
        // Xóa dịch vụ
        [HttpDelete("{maDichVu}")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteDichVu(string maDichVu)
        {
            var dichVu = _dichVuRepo.DeleteDichVu(maDichVu);
            if (dichVu == null)
            {
                return NotFound("Không tìm thấy dịch vụ với ID đã cho.");
            }
            return Ok(dichVu);
        }
    }
}