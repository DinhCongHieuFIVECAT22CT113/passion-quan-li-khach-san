using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace be_quanlikhachsanapi.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly DataQlks113Nhom2Context _context;

        public NotificationService(IHubContext<NotificationHub> hubContext, DataQlks113Nhom2Context context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        public async Task NotifyBookingCreated(DatPhong datPhong)
        {
            // Lấy thông tin chi tiết đặt phòng
            var chiTietDatPhong = _context.ChiTietDatPhongs
                .FirstOrDefault(ct => ct.MaDatPhong == datPhong.MaDatPhong);

            // Lấy thông tin phòng
            var phong = chiTietDatPhong != null && chiTietDatPhong.MaPhong != null
                ? _context.Phongs.FirstOrDefault(p => p.MaPhong == chiTietDatPhong.MaPhong)
                : null;

            // Lấy thông tin khách hàng
            var khachHang = datPhong.MaKh != null
                ? _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == datPhong.MaKh)
                : null;

            // Tạo đối tượng thông báo
            var notification = new
            {
                type = "booking_created",
                data = new
                {
                    maDatPhong = datPhong.MaDatPhong,
                    maKhachHang = datPhong.MaKh,
                    tenKhachHang = khachHang != null ? $"{khachHang.HoKh} {khachHang.TenKh}" : "Khách vãng lai",
                    maPhong = chiTietDatPhong?.MaPhong,
                    soPhong = phong?.SoPhong,
                    ngayNhanPhong = datPhong.NgayNhanPhong,
                    ngayTraPhong = datPhong.NgayTraPhong,
                    trangThai = datPhong.TrangThai,
                    thoiGianTao = DateTime.Now
                }
            };

            // Gửi thông báo đến tất cả admin và nhân viên
            await _hubContext.Clients.Groups("admin").SendAsync("ReceiveNotification", notification);
            await _hubContext.Clients.Groups("staff").SendAsync("ReceiveNotification", notification);
        }

        public async Task NotifyBookingUpdated(DatPhong datPhong)
        {
            // Tương tự như NotifyBookingCreated nhưng với loại thông báo khác
            var chiTietDatPhong = _context.ChiTietDatPhongs
                .FirstOrDefault(ct => ct.MaDatPhong == datPhong.MaDatPhong);

            var phong = chiTietDatPhong != null && chiTietDatPhong.MaPhong != null
                ? _context.Phongs.FirstOrDefault(p => p.MaPhong == chiTietDatPhong.MaPhong)
                : null;

            var khachHang = datPhong.MaKh != null
                ? _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == datPhong.MaKh)
                : null;

            var notification = new
            {
                type = "booking_updated",
                data = new
                {
                    maDatPhong = datPhong.MaDatPhong,
                    maKhachHang = datPhong.MaKh,
                    tenKhachHang = khachHang != null ? $"{khachHang.HoKh} {khachHang.TenKh}" : "Khách vãng lai",
                    maPhong = chiTietDatPhong?.MaPhong,
                    soPhong = phong?.SoPhong,
                    ngayNhanPhong = datPhong.NgayNhanPhong,
                    ngayTraPhong = datPhong.NgayTraPhong,
                    trangThai = datPhong.TrangThai,
                    thoiGianCapNhat = DateTime.Now
                }
            };

            // Gửi thông báo đến tất cả admin và nhân viên
            await _hubContext.Clients.Groups("admin").SendAsync("ReceiveNotification", notification);
            await _hubContext.Clients.Groups("staff").SendAsync("ReceiveNotification", notification);

            // Nếu khách hàng có ID, gửi thông báo đến khách hàng đó
            if (!string.IsNullOrEmpty(datPhong.MaKh))
            {
                await _hubContext.Clients.Group($"customer_{datPhong.MaKh}").SendAsync("ReceiveNotification", notification);
            }
        }

        public async Task NotifyBookingStatusChanged(string maDatPhong, string trangThai)
        {
            var datPhong = _context.DatPhongs.FirstOrDefault(dp => dp.MaDatPhong == maDatPhong);
            if (datPhong == null) return;

            var chiTietDatPhong = _context.ChiTietDatPhongs
                .FirstOrDefault(ct => ct.MaDatPhong == maDatPhong);

            var phong = chiTietDatPhong != null && chiTietDatPhong.MaPhong != null
                ? _context.Phongs.FirstOrDefault(p => p.MaPhong == chiTietDatPhong.MaPhong)
                : null;

            var notification = new
            {
                type = "booking_status_changed",
                data = new
                {
                    maDatPhong = maDatPhong,
                    maPhong = chiTietDatPhong?.MaPhong,
                    soPhong = phong?.SoPhong,
                    trangThaiCu = datPhong.TrangThai,
                    trangThaiMoi = trangThai,
                    thoiGianCapNhat = DateTime.Now
                }
            };

            // Gửi thông báo đến tất cả admin và nhân viên
            await _hubContext.Clients.Groups("admin").SendAsync("ReceiveNotification", notification);
            await _hubContext.Clients.Groups("staff").SendAsync("ReceiveNotification", notification);

            // Nếu khách hàng có ID, gửi thông báo đến khách hàng đó
            if (!string.IsNullOrEmpty(datPhong.MaKh))
            {
                await _hubContext.Clients.Group($"customer_{datPhong.MaKh}").SendAsync("ReceiveNotification", notification);
            }
        }

        public async Task NotifyRoomStatusChanged(string maPhong, string trangThai)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == maPhong);
            if (phong == null) return;

            var notification = new
            {
                type = "room_status_changed",
                data = new
                {
                    maPhong = maPhong,
                    soPhong = phong.SoPhong,
                    trangThaiCu = phong.TrangThai,
                    trangThaiMoi = trangThai,
                    thoiGianCapNhat = DateTime.Now
                }
            };

            // Gửi thông báo đến tất cả admin, nhân viên và kế toán
            await _hubContext.Clients.Groups("admin").SendAsync("ReceiveNotification", notification);
            await _hubContext.Clients.Groups("staff").SendAsync("ReceiveNotification", notification);
            await _hubContext.Clients.Groups("accountant").SendAsync("ReceiveNotification", notification);
        }

        // Thêm phương thức thông báo khi hóa đơn được cập nhật
        public async Task NotifyInvoiceStatusChanged(string maHoaDon, string trangThai)
        {
            var hoaDon = _context.HoaDons.FirstOrDefault(hd => hd.MaHoaDon == maHoaDon);
            if (hoaDon == null) return;

            // Lấy thông tin đặt phòng liên quan
            var datPhong = _context.DatPhongs.FirstOrDefault(dp => dp.MaDatPhong == hoaDon.MaDatPhong);
            
            var notification = new
            {
                type = "invoice_status_changed",
                data = new
                {
                    maHoaDon = maHoaDon,
                    maDatPhong = hoaDon.MaDatPhong,
                    maKhachHang = datPhong?.MaKh,
                    tongTien = hoaDon.TongTien,
                    trangThaiCu = hoaDon.TrangThai,
                    trangThaiMoi = trangThai,
                    thoiGianCapNhat = DateTime.Now
                }
            };

            // Gửi thông báo đến tất cả admin, nhân viên và kế toán
            await _hubContext.Clients.Groups("admin").SendAsync("ReceiveNotification", notification);
            await _hubContext.Clients.Groups("staff").SendAsync("ReceiveNotification", notification);
            await _hubContext.Clients.Groups("accountant").SendAsync("ReceiveNotification", notification);

            // Nếu khách hàng có ID, gửi thông báo đến khách hàng đó
            if (datPhong != null && !string.IsNullOrEmpty(datPhong.MaKh))
            {
                await _hubContext.Clients.Group($"customer_{datPhong.MaKh}").SendAsync("ReceiveNotification", notification);
            }
        }
    }
}