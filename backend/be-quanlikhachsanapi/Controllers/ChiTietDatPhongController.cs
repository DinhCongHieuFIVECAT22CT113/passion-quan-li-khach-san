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

        [HttpGet("Lấy danh sách tất cả chi tiết đặt phòng")]
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
        [HttpGet("Tìm chi tiết đặt phòng theo ID")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maDatPhong, string maPhong)
        {
            var chiTietDatPhong = _chiTietDatPhongRepo.GetChiTietDatPhongById(maDatPhong, maPhong);
            if (chiTietDatPhong == null)
            {
                return NotFound("Không tìm thấy chi tiết đặt phòng với ID đã cho.");
            }
            return Ok(chiTietDatPhong);
        }
        [HttpPost("Tạo chi tiết đặt phòng mới")]
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
        [HttpPut("Cập nhật chi tiết đặt phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateChiTietDatPhong(string maDatPhong, string maPhong, [FromForm] UpdateChiTietDatPhongDto updateChiTietDatPhong)
        {
            var chiTietDatPhong = _chiTietDatPhongRepo.UpdateChiTietDatPhong(maDatPhong, maPhong, updateChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return NotFound("Không tìm thấy chi tiết đặt phòng với ID đã cho.");
            }
            return Ok(chiTietDatPhong);
        }
        [HttpDelete("Xóa chi tiết đặt phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteChiTietDatPhong(string maDatPhong, string maPhong)
        {
            var chiTietDatPhong = _chiTietDatPhongRepo.DeleteChiTietDatPhong(maDatPhong, maPhong);
            if (chiTietDatPhong == null)
            {
                return NotFound("Không tìm thấy chi tiết đặt phòng với ID đã cho.");
            }
            return Ok(chiTietDatPhong);
        }
    }
}