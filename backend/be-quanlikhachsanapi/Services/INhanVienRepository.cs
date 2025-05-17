using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace be_quanlikhachsanapi.Services
{
    public interface INhanVienRepository
    {
        List<NhanVienDTO> GetAll();
        JsonResult GetNhanVienById(string MaNv);
        JsonResult CreateNhanVien(CreateNhanVienDTO createNhanVien);
        JsonResult UpdateNhanVien(string MaNv, UpdateNhanVienDTO updateNhanVien);
        JsonResult DeleteNhanVien(string MaNv);
    }
    public class NhanVienRepository : INhanVienRepository
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly IPasswordHasher<NhanVien> _passwordHasher;
        public NhanVienRepository(QuanLyKhachSanContext context, IPasswordHasher<NhanVien> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public List<NhanVienDTO> GetAll()
        {
            var nhanViens = _context.NhanViens.ToList();
            return nhanViens.Select(nv => new NhanVienDTO
            {
                MaNv = nv.MaNv,
                UserName = nv.UserName,
                HoNv = nv.HoNv,
                TenNv = nv.TenNv,
                ChucVu = nv.ChucVu,
                Email = nv.Email,
                Sdt = nv.Sdt,
                LuongCoBan = nv.LuongCoBan,
                NgayVaoLam = nv.NgayVaoLam,
                MaRole = nv.MaRole,
                NgayTao = nv.NgayTao,
                NgaySua = nv.NgaySua
            }).ToList();
        }

        public JsonResult GetNhanVienById(string MaNv)
        {
            var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.MaNv == MaNv);
            if (nhanVien == null)
            {
                return new JsonResult("Không tìm thấy nhân viên với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            var _nhanVien = new NhanVienDTO
            {
                MaNv = nhanVien.MaNv,
                UserName = nhanVien.UserName,
                HoNv = nhanVien.HoNv,
                TenNv = nhanVien.TenNv,
                ChucVu = nhanVien.ChucVu,
                Email = nhanVien.Email,
                Sdt = nhanVien.Sdt,
                LuongCoBan = nhanVien.LuongCoBan,
                NgayVaoLam = nhanVien.NgayVaoLam,
                MaRole = nhanVien.MaRole,
                NgayTao = nhanVien.NgayTao,
                NgaySua = nhanVien.NgaySua
            };
            return new JsonResult(_nhanVien) { StatusCode = 200 };
        }

        public JsonResult CreateNhanVien(CreateNhanVienDTO createNhanVien)
        {
            var lastNhanVien = _context.NhanViens
                .OrderByDescending(nv => nv.MaNv)
                .FirstOrDefault();

            string newMaNv;

            if (lastNhanVien == null || string.IsNullOrEmpty(lastNhanVien.MaNv))
            {
                newMaNv = "NV01";
            }
            else
            {
                int lastNumber = int.Parse(lastNhanVien.MaNv.Substring(2));
                newMaNv = "NV" + (lastNumber + 1).ToString("D2");
            }

            var nhanVien = new NhanVien
            {
                MaNv = newMaNv,
                UserName = createNhanVien.UserName,
                HoNv = createNhanVien.HoNv,
                TenNv = createNhanVien.TenNv,
                ChucVu = createNhanVien.ChucVu,
                Email = createNhanVien.Email,
                Sdt = createNhanVien.Sdt,
                LuongCoBan = createNhanVien.LuongCoBan,
                NgayVaoLam = createNhanVien.NgayVaoLam,
                MaRole = createNhanVien.MaRole,
                NgayTao = DateTime.Now
            };
                #pragma warning disable CS8601
                nhanVien.PasswordHash = _passwordHasher.HashPassword(nhanVien, createNhanVien.Password);
                #pragma warning restore CS8601

            _context.NhanViens.Add(nhanVien);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Thêm nhân viên thành công.",
                nhanVien = newMaNv
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdateNhanVien(string MaNv, UpdateNhanVienDTO updateNhanVien)
        {
            var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.MaNv == MaNv);
            if (nhanVien == null)
            {
                return new JsonResult("Không tìm thấy nhân viên với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            nhanVien.ChucVu = updateNhanVien.ChucVu;
            nhanVien.Email = updateNhanVien.Email;
            nhanVien.Sdt = updateNhanVien.Sdt;
            nhanVien.LuongCoBan = updateNhanVien.LuongCoBan;
            nhanVien.MaRole = updateNhanVien.MaRole;
            nhanVien.NgaySua = DateTime.Now;

            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Cập nhật nhân viên thành công.",
                nhanVien = MaNv
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult DeleteNhanVien(string MaNv)
        {
            var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.MaNv == MaNv);
            if (nhanVien == null)
            {
                return new JsonResult("Không tìm thấy nhân viên với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            _context.NhanViens.Remove(nhanVien);
            _context.SaveChanges();
            return new JsonResult(new
            {
                message = "Xóa nhân viên thành công.",
                nhanVien = MaNv
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}