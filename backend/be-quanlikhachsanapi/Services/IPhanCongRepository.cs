using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface IPhanCongCaRepository
    {
        JsonResult GiaoCaLam(CreatePhanCongDTO createPhanCongDto);
        JsonResult UpdateCaLam(UpdatePhanCongDTO updatePhanCongDto);
        JsonResult GetLichLamViecByNhanVien(string maNv);
    }
}