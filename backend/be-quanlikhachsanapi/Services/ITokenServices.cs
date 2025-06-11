using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.DependencyInjection;

namespace be_quanlikhachsanapi.Services
{
    public interface ITokenService
    {
        string CreateToken(KhachHang khachHang);
        string CreateToken(NhanVien nhanVien);
        UserDto CreateTokenWithRefresh(KhachHang khachHang);
        UserDto CreateTokenWithRefresh(NhanVien nhanVien);
        UserDto? RefreshToken(RefreshTokenDto refreshTokenDto);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IServiceProvider _serviceProvider;

        public TokenService(IConfiguration config, IRefreshTokenService refreshTokenService, IServiceProvider serviceProvider)
        {
            _config = config;
            _refreshTokenService = refreshTokenService;
            _serviceProvider = serviceProvider;
            var tokenKey = _config["TokenKey"];
            ArgumentNullException.ThrowIfNull(tokenKey, nameof(tokenKey));
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        }

        public string CreateToken(KhachHang khachHang)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.NameId, khachHang.MaKh),
                new Claim(JwtRegisteredClaimNames.Email, khachHang.Email),
                new Claim("name", khachHang.HoKh + " " + khachHang.TenKh),
                new Claim("role", khachHang.MaRole ?? "CTM"),
                new Claim("mobilephone", khachHang.Sdt ?? string.Empty),
                new Claim("username", khachHang.UserName ?? string.Empty),
                new Claim("cccd", khachHang.SoCccd ?? string.Empty),
                new Claim("address", khachHang.DiaChi ?? string.Empty)
            };

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(15), // 15 phút cho bảo mật tốt hơn
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public string CreateToken(NhanVien nhanVien)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.NameId, nhanVien.MaNv),
                new Claim(JwtRegisteredClaimNames.Email, nhanVien.Email),
                new Claim("name", nhanVien.HoNv + " " + nhanVien.TenNv),
                new Claim("role", nhanVien.MaRole ?? "CRW"),
                new Claim("mobilephone", nhanVien.Sdt ?? string.Empty),
                new Claim("username", nhanVien.UserName ?? string.Empty),
                new Claim("chucvu", nhanVien.ChucVu ?? string.Empty)
            };

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(15), // 15 phút cho bảo mật tốt hơn
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public UserDto CreateTokenWithRefresh(KhachHang khachHang)
        {
            var accessToken = CreateToken(khachHang);
            var refreshToken = _refreshTokenService.GenerateRefreshToken();
            
            _refreshTokenService.StoreRefreshToken(khachHang.MaKh, refreshToken, "KhachHang");

            return new UserDto
            {
                MaNguoiDung = khachHang.MaKh,
                UserName = khachHang.UserName ?? string.Empty,
                HoTen = khachHang.HoKh + " " + khachHang.TenKh,
                Token = accessToken,
                RefreshToken = refreshToken,
                MaRole = khachHang.MaRole ?? "CTM"
            };
        }

        public UserDto CreateTokenWithRefresh(NhanVien nhanVien)
        {
            var accessToken = CreateToken(nhanVien);
            var refreshToken = _refreshTokenService.GenerateRefreshToken();
            
            _refreshTokenService.StoreRefreshToken(nhanVien.MaNv, refreshToken, "NhanVien");

            return new UserDto
            {
                MaNguoiDung = nhanVien.MaNv,
                UserName = nhanVien.UserName ?? string.Empty,
                HoTen = nhanVien.HoNv + " " + nhanVien.TenNv,
                Token = accessToken,
                RefreshToken = refreshToken,
                MaRole = nhanVien.MaRole ?? "CRW"
            };
        }

        public UserDto? RefreshToken(RefreshTokenDto refreshTokenDto)
        {
            if (!_refreshTokenService.ValidateRefreshToken(refreshTokenDto.UserId, refreshTokenDto.RefreshToken, refreshTokenDto.UserType))
            {
                return null;
            }

            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DataQlks113Nhom2Context>();

            if (refreshTokenDto.UserType == "KhachHang")
            {
                var khachHang = dbContext.KhachHangs.FirstOrDefault(k => k.MaKh == refreshTokenDto.UserId);
                if (khachHang == null) return null;

                // Revoke old refresh token and create new tokens
                _refreshTokenService.RevokeRefreshToken(refreshTokenDto.UserId, refreshTokenDto.UserType);
                return CreateTokenWithRefresh(khachHang);
            }
            else if (refreshTokenDto.UserType == "NhanVien")
            {
                var nhanVien = dbContext.NhanViens.FirstOrDefault(n => n.MaNv == refreshTokenDto.UserId);
                if (nhanVien == null) return null;

                // Revoke old refresh token and create new tokens
                _refreshTokenService.RevokeRefreshToken(refreshTokenDto.UserId, refreshTokenDto.UserType);
                return CreateTokenWithRefresh(nhanVien);
            }

            return null;
        }
    }
}
