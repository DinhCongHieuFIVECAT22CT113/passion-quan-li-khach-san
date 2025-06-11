using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using be_quanlikhachsanapi.ViewModel;
using be_quanlikhachsanapi.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;
using Google.Apis.Gmail.v1.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace be_quanlikhachsanapi.Services
{
    public interface IKhachHangRepository
    {
        List<KhachHangDto> GetAll();
        JsonResult GetKhachHangById(string MaKh);
        JsonResult CreateKhachHang(CreateKhachHangDto createKhachHang);
        JsonResult UpdateKhachHang(string MaKh, UpdateKhachHangDto updateKhachHang);
        JsonResult UpdateLoaiKhachHang(string MaKh, string MaLoaiKh);
        JsonResult DeleteKhachHang(string MaKh);
        Task<JsonResult> UploadAvatarAsync(string userName, UploadAvatarDTO dto);
        Task<JsonResult> UploadAvatarByIdAsync(string maKh, UploadAvatarDTO dto);
    }
    public class KhachHangRepository : IKhachHangRepository
    {
        private readonly DataQlks113Nhom2Context _context;
        private readonly IPasswordHasher<KhachHang> _passwordHasher;
        private readonly ISendEmailServices _sendEmail;
        private readonly IConfiguration _confMail;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ISupabaseStorageService _storageService;

        public KhachHangRepository(DataQlks113Nhom2Context context, IPasswordHasher<KhachHang> passwordHasher, ISendEmailServices sendEmail, IConfiguration confMail, IWebHostEnvironment webHostEnvironment, ISupabaseStorageService storageService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _sendEmail = sendEmail;
            _confMail = confMail;
            _webHostEnvironment = webHostEnvironment;
            _storageService = storageService;
        }

        public List<KhachHangDto> GetAll()
        {
            var khachHangs = _context.KhachHangs.ToList();
            return khachHangs.Select(kh => new KhachHangDto
            {
                MaKh = kh.MaKh,
                UserName = kh.UserName,
                HoKh = kh.HoKh,
                TenKh = kh.TenKh,
                Email = kh.Email,
                Sdt = kh.Sdt,
                DiaChi = kh.DiaChi,
                SoCccd = kh.SoCccd,
                MaLoaiKh = kh.MaLoaiKh,
                MaRole = kh.MaRole,
                AnhDaiDien = kh.AnhDaiDien, // Thêm avatar URL
            }).ToList();
        }

        public JsonResult GetKhachHangById(string MaKh)
        {
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == MaKh);
            if (khachHang == null)
            {
                return new JsonResult("Không tìm thấy khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            var _khachHang = new KhachHangDto
            {
                MaKh = khachHang.MaKh,
                UserName = khachHang.UserName,
                HoKh = khachHang.HoKh,
                TenKh = khachHang.TenKh,
                Email = khachHang.Email,
                Sdt = khachHang.Sdt,
                DiaChi = khachHang.DiaChi,
                SoCccd = khachHang.SoCccd,
                MaLoaiKh = khachHang.MaLoaiKh,
                MaRole = khachHang.MaRole,
                AnhDaiDien = khachHang.AnhDaiDien, // Thêm avatar URL
            };
            return new JsonResult(_khachHang);
        }

        public JsonResult CreateKhachHang(CreateKhachHangDto createKhachHang)
        {
            // Kiểm tra trùng UserName
            if (_context.KhachHangs.Any(kh => kh.UserName == createKhachHang.UserName))
            {
                return new JsonResult(new
                {
                    message = "Username đã tồn tại",
                    username = createKhachHang.UserName
                })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            // Tạo mã khách hàng tự động
            var lastKhachHang = _context.KhachHangs
                .OrderByDescending(kh => kh.MaKh)
                .FirstOrDefault();
            string newMaKh;
            if (lastKhachHang == null)
            {
                newMaKh = "KH001";
            }
            else
            {
                int lastNumber = int.Parse(lastKhachHang.MaKh.Substring(2));
                newMaKh = "KH" + (lastNumber + 1).ToString("D3");
            }

            // Sinh mật khẩu ngẫu nhiên
            string password = Guid.NewGuid().ToString("N").Substring(0, 6); // Generate a random password

            var khachHang = new KhachHang
            {
                MaKh = newMaKh,
                UserName = createKhachHang.UserName,
                HoKh = createKhachHang.HoKh,
                TenKh = createKhachHang.TenKh,
                Email = createKhachHang.Email,
                Sdt = createKhachHang.Sdt,
                DiaChi = createKhachHang.DiaChi,
                SoCccd = createKhachHang.SoCccd,
                MaLoaiKh = "LKH001",
                MaRole = "R04",
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };

#pragma warning disable CS8601
            khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, password);
#pragma warning restore CS8601

            _context.KhachHangs.Add(khachHang);
            _context.SaveChanges();

            // Gửi email thông báo tài khoản
            var email = new EmailModel
            {
                ToEmail = createKhachHang.Email,
                Subject = "Tài khoản của bạn đã được khởi tạo bởi quản trị viên",
                Body = $"Thông tin đăng nhập:\n- Username: {createKhachHang.UserName}\n- Mật khẩu: {password}"
            };
            _sendEmail.SendEmail(email);

            return new JsonResult("Đã khởi tạo khách hàng thành công")
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdateKhachHang(string MaKh, UpdateKhachHangDto updateKhachHang)
        {
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == MaKh);
            if (khachHang == null)
            {
                return new JsonResult("Không tìm thấy khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            if (!string.IsNullOrEmpty(updateKhachHang.HoKh))
                khachHang.HoKh = updateKhachHang.HoKh;
            if (!string.IsNullOrEmpty(updateKhachHang.TenKh))
                khachHang.TenKh = updateKhachHang.TenKh;
            khachHang.Email = updateKhachHang.Email;
            khachHang.Sdt = updateKhachHang.Sdt;
            khachHang.DiaChi = updateKhachHang.DiaChi;
            khachHang.SoCccd = updateKhachHang.SoCccd;
            khachHang.NgaySua = DateTime.Now;

            _context.SaveChanges();

            return new JsonResult("Đã cập nhật khách hàng thành công")
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult DeleteKhachHang(string MaKh)
        {
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == MaKh);
            if (khachHang == null)
            {
                return new JsonResult("Không tìm thấy khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            _context.KhachHangs.Remove(khachHang);
            _context.SaveChanges();

            return new JsonResult("Đã xóa khách hàng thành công")
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult UpdateLoaiKhachHang(string MaKh, string MaLoaiKh)
        {
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == MaKh);
            if (khachHang == null)
            {
                return new JsonResult("Không tìm thấy khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            khachHang.MaLoaiKh = MaLoaiKh;
            khachHang.NgaySua = DateTime.Now;
            _context.SaveChanges();

            return new JsonResult("Đã cập nhật loại khách hàng thành công")
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
        
        public async Task<JsonResult> UploadAvatarAsync(string userName, UploadAvatarDTO dto)
        {
            try
            {
                var khachHang = await _context.KhachHangs.FirstOrDefaultAsync(kh => kh.UserName == userName);
                if (khachHang == null)
                    return new JsonResult("Không tìm thấy khách hàng.") { StatusCode = 404 };

                if (dto.AvatarFile == null || dto.AvatarFile.Length == 0)
                    return new JsonResult("Vui lòng chọn file avatar.") { StatusCode = 400 };

                // Xóa avatar cũ trên Supabase nếu có
                if (!string.IsNullOrEmpty(khachHang.AnhDaiDien))
                {
                    await _storageService.DeleteFileAsync(khachHang.AnhDaiDien);
                }

                // Upload avatar mới lên Supabase
                var avatarUrl = await _storageService.UploadFileAsync(dto.AvatarFile, "avatars");

                // Cập nhật URL avatar trong database
                khachHang.AnhDaiDien = avatarUrl;
                await _context.SaveChangesAsync();

                return new JsonResult(new
                {
                    message = "Cập nhật avatar thành công.",
                    avatarUrl = khachHang.AnhDaiDien
                }) { StatusCode = 200 };
            }
            catch (Exception ex)
            {
                return new JsonResult($"Lỗi khi upload avatar: {ex.Message}") { StatusCode = 500 };
            }
        }
        
        public async Task<JsonResult> UploadAvatarByIdAsync(string maKh, UploadAvatarDTO dto)
        {
            try
            {
                var khachHang = await _context.KhachHangs.FirstOrDefaultAsync(kh => kh.MaKh == maKh);
                if (khachHang == null)
                    return new JsonResult("Không tìm thấy khách hàng với mã đã cho.") { StatusCode = 404 };

                if (dto.AvatarFile == null || dto.AvatarFile.Length == 0)
                    return new JsonResult("Vui lòng chọn file avatar.") { StatusCode = 400 };

                // Xóa avatar cũ trên Supabase nếu có
                if (!string.IsNullOrEmpty(khachHang.AnhDaiDien))
                {
                    await _storageService.DeleteFileAsync(khachHang.AnhDaiDien);
                }

                // Upload avatar mới lên Supabase
                var avatarUrl = await _storageService.UploadFileAsync(dto.AvatarFile, "avatars");

                // Cập nhật URL avatar trong database
                khachHang.AnhDaiDien = avatarUrl;
                await _context.SaveChangesAsync();

                return new JsonResult(new
                {
                    message = "Cập nhật avatar thành công.",
                    avatarUrl = khachHang.AnhDaiDien
                }) { StatusCode = 200 };
            }
            catch (Exception ex)
            {
                return new JsonResult($"Lỗi khi upload avatar: {ex.Message}") { StatusCode = 500 };
            }
        }
    }
}