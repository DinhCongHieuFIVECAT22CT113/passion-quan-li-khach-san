using be_quanlikhachsanapi.Data;
using System.Threading.Tasks;

namespace be_quanlikhachsanapi.Services
{
    public interface INotificationService
    {
        Task NotifyBookingCreated(DatPhong datPhong);
        Task NotifyBookingUpdated(DatPhong datPhong);
        Task NotifyBookingStatusChanged(string maDatPhong, string trangThai);
        Task NotifyRoomStatusChanged(string maPhong, string trangThai);
    }
}