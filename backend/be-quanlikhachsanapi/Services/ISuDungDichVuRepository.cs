using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface ISuDungDichVuRepository
    {
        Task<List<SuDungDichVuDTO>> GetAllAsync();
        Task<SuDungDichVuDTO> GetByIdAsync(string maSuDung);
        Task<List<SuDungDichVuDTO>> GetByDatPhongAsync(string maDatPhong);
        Task<string> CreateAsync(CreateSuDungDichVuDTO createDto);
        Task<bool> UpdateAsync(string maSuDung, UpdateSuDungDichVuDTO updateDto);
        Task<bool> DeleteAsync(string maSuDung);
    }
}