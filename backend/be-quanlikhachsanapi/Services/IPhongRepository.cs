using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface IPhongRepository
    {
        List<PhongDTO> GetAll();
        JsonResult GetPhongById(string MaPhong);
        JsonResult CreatePhong(CreatePhongDTO createPhong);
        JsonResult UpdatePhong(string MaPhong, UpdatePhongDTO updatePhong);
        JsonResult DeletePhong(string MaPhong);
        JsonResult UpdateTrangThai(string MaPhong, string TrangThai);
    }
    public class PhongRepository : IPhongRepository
    {
        private readonly QuanLyKhachSanContext _context;
        
        public PhongRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public List<PhongDTO> GetAll()
        {
            var phongs = _context.Phongs.ToList();
            return phongs.Select(p => new PhongDTO
            {
                MaPhong = p.MaPhong,
                MaLoaiPhong = p.MaLoaiPhong,
                SoPhong = p.SoPhong,
                Thumbnail = p.Thumbnail,
                HinhAnh = p.HinhAnh,
                TrangThai = p.TrangThai,
                Tang = p.Tang
            }).ToList();
        }   
        public JsonResult GetPhongById(string MaPhong)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
            var _phong  = new PhongDTO
            {
                MaPhong = phong.MaPhong,
                MaLoaiPhong = phong.MaLoaiPhong,
                SoPhong = phong.SoPhong,
                Thumbnail = phong.Thumbnail,
                HinhAnh = phong.HinhAnh,
                TrangThai = phong.TrangThai,
                Tang = phong.Tang
            };
            return new JsonResult(_phong);
        }
        public JsonResult CreatePhong(CreatePhongDTO createPhong)
        {
            // Tìm mã phòng mới lớn nhất hiện tại
            var lastPhong = _context.Phongs
                .OrderByDescending(p => p.MaPhong)
                .FirstOrDefault();

            string newMaPhong;

            if (lastPhong == null || string.IsNullOrEmpty(lastPhong.MaPhong))
            {
                newMaPhong = "P001";
            }
            else
            {
                // Tách phần số trong mã phòng (ví dụ từ "P023" => 23)
                var soHienTai = int.Parse(lastPhong.MaPhong.Substring(2));
                newMaPhong = "P" + (soHienTai + 1).ToString("D3");
            }

            var phong = new Phong
            {
                MaPhong = newMaPhong,
                MaLoaiPhong = createPhong.MaLoaiPhong,
                SoPhong = createPhong.SoPhong,
                Thumbnail = createPhong.Thumbnail,
                HinhAnh = createPhong.HinhAnh,
                TrangThai = createPhong.TrangThai,
                Tang = createPhong.Tang,
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };

            _context.Phongs.Add(phong);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Thêm phòng thành công.",
                maPhong = newMaPhong
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdatePhong(string MaPhong, UpdatePhongDTO updatePhong)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
            if (phong == null)
            {
                return new JsonResult("Không tìm thấy phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                phong.MaLoaiPhong = updatePhong.MaLoaiPhong;
                phong.SoPhong = updatePhong.SoPhong;
                phong.Thumbnail = updatePhong.Thumbnail;
                phong.HinhAnh = updatePhong.HinhAnh;
                phong.TrangThai = updatePhong.TrangThai;
                phong.Tang = updatePhong.Tang;
                phong.NgaySua = DateTime.Now;

                _context.SaveChanges();

                return new JsonResult("Cập nhật phòng thành công.")
                {
                    StatusCode = StatusCodes.Status200OK
                };  
            }
        }

        public JsonResult DeletePhong(string MaPhong)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
            if (phong == null)
            {
                return new JsonResult("Không tìm thấy phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                _context.Phongs.Remove(phong);
                _context.SaveChanges();

                return new JsonResult("Xóa phòng thành công.")
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
        public JsonResult UpdateTrangThai(string MaPhong, string TrangThai)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
            if (phong == null)
            {
                return new JsonResult("Không tìm thấy phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                phong.TrangThai = TrangThai;
                _context.SaveChanges();

                return new JsonResult("Cập nhật trạng thái phòng thành công.")
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }    
    }
}