using be_quanlikhachsanapi.Data;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Services
{
    public interface IImageMigrationService
    {
        Task<MigrationResult> MigrateAllImagesToSupabaseAsync();
        Task<MigrationResult> MigrateDichVuImagesAsync();
        Task<MigrationResult> MigrateKhuyenMaiImagesAsync();
        Task<MigrationResult> CleanupMissingImagesAsync();
    }

    public class MigrationResult
    {
        public int TotalItems { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> SuccessMessages { get; set; } = new();
    }

    public class ImageMigrationService : IImageMigrationService
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly ISupabaseStorageService _supabaseStorage;
        private readonly ILogger<ImageMigrationService> _logger;
        private readonly IWebHostEnvironment _environment;

        public ImageMigrationService(
            QuanLyKhachSanContext context,
            ISupabaseStorageService supabaseStorage,
            ILogger<ImageMigrationService> logger,
            IWebHostEnvironment environment)
        {
            _context = context;
            _supabaseStorage = supabaseStorage;
            _logger = logger;
            _environment = environment;
        }

        public async Task<MigrationResult> MigrateAllImagesToSupabaseAsync()
        {
            var result = new MigrationResult();

            try
            {
                _logger.LogInformation("Starting migration of all images to Supabase");

                // Migrate DichVu images
                var dichVuResult = await MigrateDichVuImagesAsync();
                result.TotalItems += dichVuResult.TotalItems;
                result.SuccessCount += dichVuResult.SuccessCount;
                result.FailureCount += dichVuResult.FailureCount;
                result.Errors.AddRange(dichVuResult.Errors);
                result.SuccessMessages.AddRange(dichVuResult.SuccessMessages);

                // Migrate KhuyenMai images
                var khuyenMaiResult = await MigrateKhuyenMaiImagesAsync();
                result.TotalItems += khuyenMaiResult.TotalItems;
                result.SuccessCount += khuyenMaiResult.SuccessCount;
                result.FailureCount += khuyenMaiResult.FailureCount;
                result.Errors.AddRange(khuyenMaiResult.Errors);
                result.SuccessMessages.AddRange(khuyenMaiResult.SuccessMessages);

                _logger.LogInformation($"Migration completed. Total: {result.TotalItems}, Success: {result.SuccessCount}, Failed: {result.FailureCount}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during migration");
                result.Errors.Add($"Migration failed: {ex.Message}");
            }

            return result;
        }

        public async Task<MigrationResult> MigrateDichVuImagesAsync()
        {
            var result = new MigrationResult();

            try
            {
                var dichVus = await _context.DichVus
                    .Where(dv => !string.IsNullOrEmpty(dv.Thumbnail))
                    .ToListAsync();

                result.TotalItems = dichVus.Count;
                _logger.LogInformation($"Found {dichVus.Count} DichVu items with thumbnails to migrate");

                foreach (var dichVu in dichVus)
                {
                    try
                    {
                        if (string.IsNullOrEmpty(dichVu.Thumbnail))
                            continue;

                        // Skip if already a Supabase URL
                        if (dichVu.Thumbnail.Contains("supabase.co"))
                        {
                            result.SuccessCount++;
                            result.SuccessMessages.Add($"DichVu {dichVu.MaDichVu}: Already using Supabase URL");
                            continue;
                        }

                        // Try to find and upload the local file
                        var localFilePath = GetLocalFilePath(dichVu.Thumbnail);
                        if (File.Exists(localFilePath))
                        {
                            var fileBytes = await File.ReadAllBytesAsync(localFilePath);
                            var fileName = Path.GetFileName(localFilePath);
                            var extension = Path.GetExtension(fileName);

                            // Create a temporary IFormFile
                            using var stream = new MemoryStream(fileBytes);
                            var formFile = new FormFile(stream, 0, fileBytes.Length, "file", fileName)
                            {
                                Headers = new HeaderDictionary(),
                                ContentType = GetContentType(extension)
                            };

                            // Upload to Supabase
                            var supabaseUrl = await _supabaseStorage.UploadFileAsync(formFile, "services");

                            // Update database
                            dichVu.Thumbnail = supabaseUrl;
                            dichVu.NgaySua = DateTime.Now;

                            result.SuccessCount++;
                            result.SuccessMessages.Add($"DichVu {dichVu.MaDichVu}: Migrated successfully");
                            _logger.LogInformation($"Migrated DichVu {dichVu.MaDichVu} image to Supabase");
                        }
                        else
                        {
                            result.FailureCount++;
                            result.Errors.Add($"DichVu {dichVu.MaDichVu}: Local file not found - {localFilePath}");
                            _logger.LogWarning($"Local file not found for DichVu {dichVu.MaDichVu}: {localFilePath}");
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailureCount++;
                        result.Errors.Add($"DichVu {dichVu.MaDichVu}: {ex.Message}");
                        _logger.LogError(ex, $"Error migrating DichVu {dichVu.MaDichVu}");
                    }
                }

                // Save all changes
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during DichVu migration");
                result.Errors.Add($"DichVu migration failed: {ex.Message}");
            }

            return result;
        }

        public async Task<MigrationResult> MigrateKhuyenMaiImagesAsync()
        {
            var result = new MigrationResult();

            try
            {
                var khuyenMais = await _context.KhuyenMais
                    .Where(km => !string.IsNullOrEmpty(km.Thumbnail))
                    .ToListAsync();

                result.TotalItems = khuyenMais.Count;
                _logger.LogInformation($"Found {khuyenMais.Count} KhuyenMai items with thumbnails to migrate");

                foreach (var khuyenMai in khuyenMais)
                {
                    try
                    {
                        if (string.IsNullOrEmpty(khuyenMai.Thumbnail))
                            continue;

                        // Skip if already a Supabase URL
                        if (khuyenMai.Thumbnail.Contains("supabase.co"))
                        {
                            result.SuccessCount++;
                            result.SuccessMessages.Add($"KhuyenMai {khuyenMai.MaKm}: Already using Supabase URL");
                            continue;
                        }

                        // Try to find and upload the local file
                        var localFilePath = GetLocalFilePath(khuyenMai.Thumbnail);
                        if (File.Exists(localFilePath))
                        {
                            var fileBytes = await File.ReadAllBytesAsync(localFilePath);
                            var fileName = Path.GetFileName(localFilePath);
                            var extension = Path.GetExtension(fileName);

                            // Create a temporary IFormFile
                            using var stream = new MemoryStream(fileBytes);
                            var formFile = new FormFile(stream, 0, fileBytes.Length, "file", fileName)
                            {
                                Headers = new HeaderDictionary(),
                                ContentType = GetContentType(extension)
                            };

                            // Upload to Supabase
                            var supabaseUrl = await _supabaseStorage.UploadFileAsync(formFile, "promotions");

                            // Update database
                            khuyenMai.Thumbnail = supabaseUrl;

                            result.SuccessCount++;
                            result.SuccessMessages.Add($"KhuyenMai {khuyenMai.MaKm}: Migrated successfully");
                            _logger.LogInformation($"Migrated KhuyenMai {khuyenMai.MaKm} image to Supabase");
                        }
                        else
                        {
                            result.FailureCount++;
                            result.Errors.Add($"KhuyenMai {khuyenMai.MaKm}: Local file not found - {localFilePath}");
                            _logger.LogWarning($"Local file not found for KhuyenMai {khuyenMai.MaKm}: {localFilePath}");
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailureCount++;
                        result.Errors.Add($"KhuyenMai {khuyenMai.MaKm}: {ex.Message}");
                        _logger.LogError(ex, $"Error migrating KhuyenMai {khuyenMai.MaKm}");
                    }
                }

                // Save all changes
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during KhuyenMai migration");
                result.Errors.Add($"KhuyenMai migration failed: {ex.Message}");
            }

            return result;
        }

        public async Task<MigrationResult> CleanupMissingImagesAsync()
        {
            var result = new MigrationResult();

            try
            {
                _logger.LogInformation("Starting cleanup of missing image paths");

                // Cleanup DichVu images
                var dichVus = await _context.DichVus
                    .Where(dv => !string.IsNullOrEmpty(dv.Thumbnail) && !dv.Thumbnail.Contains("supabase.co"))
                    .ToListAsync();

                // Cleanup KhuyenMai images
                var khuyenMais = await _context.KhuyenMais
                    .Where(km => !string.IsNullOrEmpty(km.Thumbnail) && !km.Thumbnail.Contains("supabase.co"))
                    .ToListAsync();

                result.TotalItems = dichVus.Count + khuyenMais.Count;

                // Process DichVu
                foreach (var dichVu in dichVus)
                {
                    try
                    {
                        var localFilePath = GetLocalFilePath(dichVu.Thumbnail);
                        if (!File.Exists(localFilePath))
                        {
                            // File doesn't exist, set thumbnail to NULL
                            dichVu.Thumbnail = null;
                            dichVu.NgaySua = DateTime.Now;
                            result.SuccessCount++;
                            result.SuccessMessages.Add($"DichVu {dichVu.MaDichVu}: Cleaned up missing image path");
                            _logger.LogInformation($"Cleaned up missing image for DichVu {dichVu.MaDichVu}");
                        }
                        else
                        {
                            result.SuccessMessages.Add($"DichVu {dichVu.MaDichVu}: File exists, skipped");
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailureCount++;
                        result.Errors.Add($"DichVu {dichVu.MaDichVu}: {ex.Message}");
                        _logger.LogError(ex, $"Error cleaning up DichVu {dichVu.MaDichVu}");
                    }
                }

                // Process KhuyenMai
                foreach (var khuyenMai in khuyenMais)
                {
                    try
                    {
                        var localFilePath = GetLocalFilePath(khuyenMai.Thumbnail);
                        if (!File.Exists(localFilePath))
                        {
                            // File doesn't exist, set thumbnail to NULL
                            khuyenMai.Thumbnail = null;
                            result.SuccessCount++;
                            result.SuccessMessages.Add($"KhuyenMai {khuyenMai.MaKm}: Cleaned up missing image path");
                            _logger.LogInformation($"Cleaned up missing image for KhuyenMai {khuyenMai.MaKm}");
                        }
                        else
                        {
                            result.SuccessMessages.Add($"KhuyenMai {khuyenMai.MaKm}: File exists, skipped");
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailureCount++;
                        result.Errors.Add($"KhuyenMai {khuyenMai.MaKm}: {ex.Message}");
                        _logger.LogError(ex, $"Error cleaning up KhuyenMai {khuyenMai.MaKm}");
                    }
                }

                // Save all changes
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Cleanup completed. Total: {result.TotalItems}, Success: {result.SuccessCount}, Failed: {result.FailureCount}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during cleanup");
                result.Errors.Add($"Cleanup failed: {ex.Message}");
            }

            return result;
        }

        public async Task<MigrationResult> CleanupMissingImagesAsync()
        {
            var result = new MigrationResult();

            try
            {
                _logger.LogInformation("Starting cleanup of missing image paths");

                // Get all DichVus with non-Supabase image paths
                var dichVusToClean = await _context.DichVus
                    .Where(dv => !string.IsNullOrEmpty(dv.Thumbnail) && !dv.Thumbnail.Contains("supabase.co"))
                    .ToListAsync();

                // Get all KhuyenMais with non-Supabase image paths
                var khuyenMaisToClean = await _context.KhuyenMais
                    .Where(km => !string.IsNullOrEmpty(km.Thumbnail) && !km.Thumbnail.Contains("supabase.co"))
                    .ToListAsync();

                result.TotalItems = dichVusToClean.Count + khuyenMaisToClean.Count;

                // Clean DichVu images
                foreach (var dichVu in dichVusToClean)
                {
                    try
                    {
                        var localFilePath = GetLocalFilePath(dichVu.Thumbnail);
                        if (!File.Exists(localFilePath))
                        {
                            dichVu.Thumbnail = null;
                            dichVu.NgaySua = DateTime.Now;
                            result.SuccessCount++;
                            result.SuccessMessages.Add($"DichVu {dichVu.MaDichVu}: Cleaned missing image path");
                        }
                        else
                        {
                            result.SuccessMessages.Add($"DichVu {dichVu.MaDichVu}: File exists, keeping path");
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailureCount++;
                        result.Errors.Add($"DichVu {dichVu.MaDichVu}: {ex.Message}");
                    }
                }

                // Clean KhuyenMai images
                foreach (var khuyenMai in khuyenMaisToClean)
                {
                    try
                    {
                        var localFilePath = GetLocalFilePath(khuyenMai.Thumbnail);
                        if (!File.Exists(localFilePath))
                        {
                            khuyenMai.Thumbnail = null;
                            result.SuccessCount++;
                            result.SuccessMessages.Add($"KhuyenMai {khuyenMai.MaKm}: Cleaned missing image path");
                        }
                        else
                        {
                            result.SuccessMessages.Add($"KhuyenMai {khuyenMai.MaKm}: File exists, keeping path");
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailureCount++;
                        result.Errors.Add($"KhuyenMai {khuyenMai.MaKm}: {ex.Message}");
                    }
                }

                // Save all changes
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Cleanup completed. Total: {result.TotalItems}, Cleaned: {result.SuccessCount}, Failed: {result.FailureCount}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during cleanup");
                result.Errors.Add($"Cleanup failed: {ex.Message}");
            }

            return result;
        }

        private string GetLocalFilePath(string thumbnailPath)
        {
            // Handle different path formats
            if (thumbnailPath.StartsWith("Upload/") || thumbnailPath.StartsWith("upload/"))
            {
                // Format: Upload/Images/services/filename.jpg
                var relativePath = thumbnailPath.Replace("Upload/", "UpLoad\\").Replace("/", "\\");
                return Path.Combine(_environment.ContentRootPath, relativePath);
            }
            else if (thumbnailPath.StartsWith("/images/"))
            {
                // Format: /images/services/filename.jpg or /images/promotions/filename.jpg
                // Try frontend public folder first
                var frontendPath = Path.Combine(_environment.ContentRootPath, "..", "..", "frontend", "fe-quanlikhachsan", "public", thumbnailPath.TrimStart('/').Replace("/", "\\"));
                if (File.Exists(frontendPath))
                {
                    return frontendPath;
                }
                
                // Fallback to backend wwwroot
                return Path.Combine(_environment.WebRootPath, thumbnailPath.TrimStart('/').Replace("/", "\\"));
            }
            else if (thumbnailPath.StartsWith("/"))
            {
                // Format: /filename.jpg
                return Path.Combine(_environment.WebRootPath, thumbnailPath.TrimStart('/').Replace("/", "\\"));
            }
            else if (Path.IsPathRooted(thumbnailPath))
            {
                // Absolute path
                return thumbnailPath;
            }
            else
            {
                // Relative path, assume it's in wwwroot
                return Path.Combine(_environment.WebRootPath, thumbnailPath.Replace("/", "\\"));
            }
        }

        private string GetContentType(string extension)
        {
            return extension.ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".bmp" => "image/bmp",
                _ => "application/octet-stream"
            };
        }

        public async Task<MigrationResult> CleanupMissingImagesAsync()
        {
            var result = new MigrationResult();

            try
            {
                _logger.LogInformation("Starting cleanup of missing image paths");

                // Cleanup DichVu images
                var dichVus = await _context.DichVus
                    .Where(dv => !string.IsNullOrEmpty(dv.Thumbnail) && 
                                !dv.Thumbnail.Contains("supabase.co"))
                    .ToListAsync();

                foreach (var dichVu in dichVus)
                {
                    var localFilePath = GetLocalFilePath(dichVu.Thumbnail);
                    if (!File.Exists(localFilePath))
                    {
                        dichVu.Thumbnail = null; // Set to NULL since file doesn't exist
                        dichVu.NgaySua = DateTime.Now;
                        result.SuccessCount++;
                        result.SuccessMessages.Add($"DichVu {dichVu.MaDichVu}: Cleared missing image path");
                    }
                }

                // Cleanup KhuyenMai images
                var khuyenMais = await _context.KhuyenMais
                    .Where(km => !string.IsNullOrEmpty(km.Thumbnail) && 
                                !km.Thumbnail.Contains("supabase.co"))
                    .ToListAsync();

                foreach (var khuyenMai in khuyenMais)
                {
                    var localFilePath = GetLocalFilePath(khuyenMai.Thumbnail);
                    if (!File.Exists(localFilePath))
                    {
                        khuyenMai.Thumbnail = null; // Set to NULL since file doesn't exist
                        result.SuccessCount++;
                        result.SuccessMessages.Add($"KhuyenMai {khuyenMai.MaKm}: Cleared missing image path");
                    }
                }

                result.TotalItems = dichVus.Count + khuyenMais.Count;

                // Save all changes
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Cleanup completed. Total: {result.TotalItems}, Cleaned: {result.SuccessCount}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during cleanup");
                result.Errors.Add($"Cleanup failed: {ex.Message}");
            }

            return result;
        }
    }
}