using be_quanlikhachsanapi.DTOs;

namespace be_quanlikhachsanapi.Services
{
    public interface IApDungKMRepository
    {
        Task<IEnumerable<ApDungKMDTO>> GetAllAsync();
        Task<ApDungKMDTO> GetByIdAsync(string maApDung);
        Task<IEnumerable<ApDungKMDTO>> GetByDatPhongAsync(string maDatPhong);
        Task<string> CreateAsync(CreateApDungKMDTO createDto);
        Task<bool> UpdateAsync(string maApDung, UpdateApDungKMDTO updateDto);
        Task<bool> DeleteAsync(string maApDung);
    }
}