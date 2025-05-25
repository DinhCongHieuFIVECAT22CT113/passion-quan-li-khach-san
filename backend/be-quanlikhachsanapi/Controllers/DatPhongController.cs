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
    public class DatPhongController : ControllerBase
    {
        private readonly IDatPhongRepository _datPhongRepo;

        public DatPhongController(IDatPhongRepository datPhongRepo)
        {
            _datPhongRepo = datPhongRepo;
        }   

        // Lấy tất cả danh sách đặt phòng
        [HttpGet]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetAll()
        {
            var datPhongs = _datPhongRepo.GetAll();
            if (datPhongs == null || datPhongs.Count == 0)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng nào.");
            }
            return Ok(datPhongs);
        }
        // Tìm đặt phòng theo ID
        [HttpGet("{maDatPhong}")]
        [RequireRole("R00", "R01", "R02", "R03")]
        public IActionResult GetByID(string maDatPhong)
        {
            var datPhong = _datPhongRepo.GetDatPhongById(maDatPhong);
            if (datPhong == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(datPhong);
        }
        // Tạo đặt phòng mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R03")]
        public IActionResult CreateDatPhong([FromForm] CreateDatPhongDTO createDatPhong)
        {
            var datPhong = _datPhongRepo.CreateDatPhong(createDatPhong);
            if (datPhong == null)
            {
                return BadRequest("Không thể tạo thông tin đặt phòng mới.");
            }
            return Ok(datPhong);
        }
        // Cập nhật đặt phòng
        [HttpPut("{maDatPhong}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult UpdateDatPhong(string maDatPhong, [FromForm] UpdateDatPhongDTO updateDatPhong)
        {
            var datPhong = _datPhongRepo.UpdateDatPhong(maDatPhong, updateDatPhong);
            if (datPhong == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(datPhong);
        }
        // Xóa đặt phòng
        [HttpDelete("{maDatPhong}")]
        [RequireRole("R00", "R01")]
        public IActionResult DeleteDatPhong(string maDatPhong)
        {
            var result = _datPhongRepo.DeleteDatPhong(maDatPhong);
            if (result == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(result);
        }
        // Cập nhật trạng thái đặt phòng
        [HttpPut("{maDatPhong}/trangthai")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult UpdateTrangThai(string maDatPhong, [FromBody] UpdateTrangThaiDTO trangThaiDto)
        {
            var result = _datPhongRepo.UpdateTrangThai(maDatPhong, trangThaiDto.TrangThai);
            if (result == null)
            {
                return NotFound("Không tìm thấy thông tin đặt phòng với ID đã cho.");
            }
            return Ok(result);
        }
    }
}