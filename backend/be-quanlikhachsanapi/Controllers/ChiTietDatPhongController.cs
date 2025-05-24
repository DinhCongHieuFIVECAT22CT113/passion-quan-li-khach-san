using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChiTietDatPhongController : ControllerBase
    {
        private readonly IChiTietDatPhongRepository _chiTietDatPhongRepo;

        public ChiTietDatPhongController(IChiTietDatPhongRepository chiTietDatPhongRepo)
        {
            _chiTietDatPhongRepo = chiTietDatPhongRepo;
        }

        // Lấy danh sách tất cả chi tiết đặt phòng
        [HttpGet]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var chiTietDatPhongs = _chiTietDatPhongRepo.GetAll();
            if (chiTietDatPhongs == null || chiTietDatPhongs.Count == 0)
            {
                return NotFound("Không tìm thấy chi tiết đặt phòng nào.");
            }
            return Ok(chiTietDatPhongs);
        }
        // Tìm chi tiết đặt phòng theo ID
        [HttpGet("{maChiTietDatPhong}")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string MaChiTietDatPhong)
        {
            var chiTietDatPhong = _chiTietDatPhongRepo.GetChiTietDatPhongById(MaChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return NotFound("Không tìm thấy chi tiết đặt phòng với ID đã cho.");
            }
            return Ok(chiTietDatPhong);
        }
        // Tạo chi tiết đặt phòng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        public IActionResult CreateChiTietDatPhong([FromForm] CreateChiTietDatPhongDto createChiTietDatPhong)
        {
            var chiTietDatPhong = _chiTietDatPhongRepo.CreateChiTietDatPhong(createChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return BadRequest("Không thể tạo chi tiết đặt phòng mới.");
            }
            return Ok(chiTietDatPhong);
        }
        // Cập nhật chi tiết đặt phòng
        [HttpPut("{maChiTietDatPhong}")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateChiTietDatPhong(string MaChiTietDatPhong, [FromForm] UpdateChiTietDatPhongDto updateChiTietDatPhong)
        {
            var chiTietDatPhong = _chiTietDatPhongRepo.UpdateChiTietDatPhong(MaChiTietDatPhong, updateChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return NotFound("Không tìm thấy chi tiết đặt phòng với ID đã cho.");
            }
            return Ok(chiTietDatPhong);
        }
        
        // Xóa chi tiết đặt phòng
        [HttpDelete("{maChiTietDatPhong}")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteChiTietDatPhong(string MaChiTietDatPhong)
        {
            var chiTietDatPhong = _chiTietDatPhongRepo.DeleteChiTietDatPhong(MaChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return NotFound("Không tìm thấy chi tiết đặt phòng với ID đã cho.");
            }
            return Ok(chiTietDatPhong);
        }
    }
}