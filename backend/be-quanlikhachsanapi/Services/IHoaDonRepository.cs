using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;

namespace be_quanlikhachsanapi.Services
{
    public interface IHoaDonRepository
    {
        Task<IEnumerable<HoaDonDTO>> GetAllAsync();
        Task<HoaDonDTO> GetByIdAsync(string maHoaDon);
        Task<HoaDonDTO> GetByDatPhongAsync(string maDatPhong);
        Task<string> CreateAsync(CreateHoaDonDTO createDto);
        Task<bool> UpdateAsync(string maHoaDon, UpdateHoaDonDTO updateDto);
        Task<bool> DeleteAsync(string maHoaDon);
        Task<bool> UpdateTrangThaiAsync(string maHoaDon, string trangThai);
        Task<decimal> TinhTongDoanhThuAsync(int thang, int nam);
    }
}