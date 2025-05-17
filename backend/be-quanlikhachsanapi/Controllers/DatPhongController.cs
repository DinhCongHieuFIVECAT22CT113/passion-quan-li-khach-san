using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatPhongController : ControllerBase
    {
        private readonly IDatPhongRepository _datPhongRepo;

        public DatPhongController(IDatPhongRepository datPhongRepo)
        {
            _datPhongRepo = datPhongRepo;
        }

        [HttpGet("Lấy danh sách đặt phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult GetAll()
        {
            var datPhongs = _datPhongRepo.GetAll();
            if (datPhongs == null || datPhongs.Count == 0)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng nào.");
            }
            return Ok(datPhongs);
        }

        [HttpGet("Tìm đặt phòng theo ID")]
        [Consumes("multipart/form-data")]
        public IActionResult GetByID(string maDatPhong)
        {
            var datPhong = _datPhongRepo.GetDatPhongById(maDatPhong);
            if (datPhong == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(datPhong);
        }

        [HttpPost("Tạo đặt phòng mới")]
        [Consumes("multipart/form-data")]
        public IActionResult CreateDatPhong([FromForm] CreateDatPhongDTO createDatPhong)
        {
            var datPhong = _datPhongRepo.CreateDatPhong(createDatPhong);
            if (datPhong == null)
            {
                return BadRequest("Không thể tạo thông tin đặt phòng mới.");
            }
            return Ok(datPhong);
        }

        [HttpPut("Cập nhật đặt phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateDatPhong(string maDatPhong, [FromForm] UpdateDatPhongDTO updateDatPhong)
        {
            var datPhong = _datPhongRepo.UpdateDatPhong(maDatPhong, updateDatPhong);
            if (datPhong == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(datPhong);
        }

        [HttpDelete("Xóa đặt phòng")]
        [Consumes("multipart/form-data")]
        public IActionResult DeleteDatPhong(string maDatPhong)
        {
            var result = _datPhongRepo.DeleteDatPhong(maDatPhong);
            if (result == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(result);
        }
    }
}