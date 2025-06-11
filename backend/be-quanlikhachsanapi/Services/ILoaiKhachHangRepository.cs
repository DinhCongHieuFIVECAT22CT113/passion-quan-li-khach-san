using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface ILoaiKhachHangRepository
    {
        List<LoaiKhachHangDto> GetAll();
        JsonResult GetLoaiKhachHangById(string maLoaiKh);
        JsonResult CreateLoaiKhachHang(CreateLoaiKhachHangDto createLoaiKhachHang);
        JsonResult UpdateLoaiKhachHang(string maLoaiKh, UpdateLoaiKhachHangDto updateLoaiKhachHang);
        JsonResult DeleteLoaiKhachHang(string maLoaiKh);
    }

    public class LoaiKhachHangRepository : ILoaiKhachHangRepository
    {
        private readonly DataQlks113Nhom2Context _context;

        public LoaiKhachHangRepository(DataQlks113Nhom2Context context)
        {
            _context = context;
        }

        public List<LoaiKhachHangDto> GetAll()
        {
            var loaiKhachHangs = _context.LoaiKhachHangs.ToList();
            return loaiKhachHangs.Select(lkh => new LoaiKhachHangDto
            {
                MaLoaiKh = lkh.MaLoaiKh,
                TenLoaiKh = lkh.TenLoaiKh,
                MoTa = lkh.MoTa,
                UuDai = lkh.UuDai
            }).ToList();
        }

        public JsonResult GetLoaiKhachHangById(string maLoaiKh)
        {
            var loaiKhachHang = _context.LoaiKhachHangs.FirstOrDefault(lkh => lkh.MaLoaiKh == maLoaiKh);
            if (loaiKhachHang == null)
            {
                return new JsonResult(null) { StatusCode = 404 };
            }
            var _loaiKhachHang = new LoaiKhachHangDto
            {
                MaLoaiKh = loaiKhachHang.MaLoaiKh,
                TenLoaiKh = loaiKhachHang.TenLoaiKh,
                MoTa = loaiKhachHang.MoTa,
                UuDai = loaiKhachHang.UuDai
            };
            return new JsonResult(_loaiKhachHang) { StatusCode = 200 };
        }

        public JsonResult CreateLoaiKhachHang(CreateLoaiKhachHangDto createLoaiKhachHang)
        {
            var lastLoaiKH = _context.LoaiKhachHangs
                .OrderByDescending(lkh => lkh.MaLoaiKh)
                .FirstOrDefault();

            string newMaLoaiKH;

            if (lastLoaiKH == null)
            {
                newMaLoaiKH = "LKH001";
            }
            else
            {
                int lastNumber = int.Parse(lastLoaiKH.MaLoaiKh.Substring(3));
                newMaLoaiKH = "LKH" + (lastNumber + 1).ToString("D3");
            }

            var loaiKhachHang = new LoaiKhachHang
            {
                MaLoaiKh = newMaLoaiKH,
                TenLoaiKh = createLoaiKhachHang.TenLoaiKh,
                MoTa = createLoaiKhachHang.MoTa,
                UuDai = createLoaiKhachHang.UuDai
            };
            _context.LoaiKhachHangs.Add(loaiKhachHang);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Thêm loại khách hàng thành công.",
                loaiKhachHang = newMaLoaiKH
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdateLoaiKhachHang(string maLoaiKh, UpdateLoaiKhachHangDto updateLoaiKhachHang)
        {
            var loaiKhachHang = _context.LoaiKhachHangs.FirstOrDefault(lkh => lkh.MaLoaiKh == maLoaiKh);
            if (loaiKhachHang == null)
            {
                return new JsonResult("Không tìm thấy loại khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            loaiKhachHang.TenLoaiKh = updateLoaiKhachHang.TenLoaiKh ?? loaiKhachHang.TenLoaiKh;
            loaiKhachHang.MoTa = updateLoaiKhachHang.MoTa ?? loaiKhachHang.MoTa;
            loaiKhachHang.UuDai = updateLoaiKhachHang.UuDai ?? loaiKhachHang.UuDai;

            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Cập nhật loại khách hàng thành công.",
                loaiKhachHang = loaiKhachHang
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult DeleteLoaiKhachHang(string maLoaiKh)
        {
            var loaiKhachHang = _context.LoaiKhachHangs.FirstOrDefault(lkh => lkh.MaLoaiKh == maLoaiKh);
            if (loaiKhachHang == null)
            {
                return new JsonResult("Không tìm thấy loại khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            _context.LoaiKhachHangs.Remove(loaiKhachHang);
            _context.SaveChanges();

            return new JsonResult("Đã xóa loại khách hàng thành công")
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}