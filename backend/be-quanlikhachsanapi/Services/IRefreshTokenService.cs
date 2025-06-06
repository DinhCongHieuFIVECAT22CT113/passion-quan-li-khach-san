using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;

namespace be_quanlikhachsanapi.Services
{
    public interface IRefreshTokenService
    {
        string GenerateRefreshToken();
        void StoreRefreshToken(string userId, string refreshToken, string userType);
        bool ValidateRefreshToken(string userId, string refreshToken, string userType);
        void RevokeRefreshToken(string userId, string userType);
    }

    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly TimeSpan _refreshTokenExpiry = TimeSpan.FromDays(7);

        public RefreshTokenService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public void StoreRefreshToken(string userId, string refreshToken, string userType)
        {
            var key = $"refresh_token_{userType}_{userId}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _refreshTokenExpiry,
                Priority = CacheItemPriority.High
            };
            
            _memoryCache.Set(key, refreshToken, cacheOptions);
        }

        public bool ValidateRefreshToken(string userId, string refreshToken, string userType)
        {
            var key = $"refresh_token_{userType}_{userId}";
            
            if (_memoryCache.TryGetValue(key, out string? storedToken))
            {
                return storedToken == refreshToken;
            }
            
            return false;
        }

        public void RevokeRefreshToken(string userId, string userType)
        {
            var key = $"refresh_token_{userType}_{userId}";
            _memoryCache.Remove(key);
        }
    }
}