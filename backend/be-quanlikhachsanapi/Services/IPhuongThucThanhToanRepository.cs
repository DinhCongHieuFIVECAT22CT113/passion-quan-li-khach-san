using be_quanlikhachsanapi.DTOs;

namespace be_quanlikhachsanapi.Services
{
    public interface IPhuongThucThanhToanRepository
    {
        Task<IEnumerable<PhuongThucThanhToanDTO>> GetAllAsync();
        Task<PhuongThucThanhToanDTO> GetByIdAsync(string maPhuongThucThanhToan);
        Task<IEnumerable<PhuongThucThanhToanDTO>> GetByHoaDonAsync(string maHoaDon);
        Task<string> CreateAsync(CreatePhuongThucThanhToanDTO createDto);
        Task<bool> UpdateAsync(string maPhuongThucThanhToan, UpdatePhuongThucThanhToanDTO updateDto);
        Task<bool> DeleteAsync(string maPhuongThucThanhToan);
        Task<bool> UpdateTrangThaiAsync(string maPhuongThucThanhToan, string trangThai);
    }
}