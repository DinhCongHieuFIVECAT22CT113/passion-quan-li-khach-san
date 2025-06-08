using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using be_quanlikhachsanapi.Data;
using Microsoft.EntityFrameworkCore;
using be_quanlikhachsanapi.Data;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole("R00")] // Only Admin can run migrations
    public class MigrationController : ControllerBase
    {
        private readonly IImageMigrationService _migrationService;
        private readonly ILogger<MigrationController> _logger;
        private readonly QuanLyKhachSanContext _context;
        private readonly ISupabaseStorageService _supabaseStorage;

        public MigrationController(
            IImageMigrationService migrationService, 
            ILogger<MigrationController> logger,
            QuanLyKhachSanContext context,
            ISupabaseStorageService supabaseStorage)
        {
            _migrationService = migrationService;
            _logger = logger;
            _context = context;
            _supabaseStorage = supabaseStorage;
        }

        /// <summary>
        /// Migrate all images from local storage to Supabase Storage
        /// </summary>
        [HttpPost("migrate-all-images")]
        public async Task<IActionResult> MigrateAllImages()
        {
            try
            {
                _logger.LogInformation("Starting migration of all images to Supabase");
                
                var result = await _migrationService.MigrateAllImagesToSupabaseAsync();
                
                return Ok(new
                {
                    message = "Migration completed",
                    totalItems = result.TotalItems,
                    successCount = result.SuccessCount,
                    failureCount = result.FailureCount,
                    errors = result.Errors,
                    successMessages = result.SuccessMessages
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during image migration");
                return StatusCode(500, new { message = "Migration failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Migrate only DichVu images to Supabase Storage
        /// </summary>
        [HttpPost("migrate-dichvu-images")]
        public async Task<IActionResult> MigrateDichVuImages()
        {
            try
            {
                _logger.LogInformation("Starting migration of DichVu images to Supabase");
                
                var result = await _migrationService.MigrateDichVuImagesAsync();
                
                return Ok(new
                {
                    message = "DichVu images migration completed",
                    totalItems = result.TotalItems,
                    successCount = result.SuccessCount,
                    failureCount = result.FailureCount,
                    errors = result.Errors,
                    successMessages = result.SuccessMessages
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during DichVu images migration");
                return StatusCode(500, new { message = "DichVu migration failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Migrate only KhuyenMai images to Supabase Storage
        /// </summary>
        [HttpPost("migrate-khuyenmai-images")]
        public async Task<IActionResult> MigrateKhuyenMaiImages()
        {
            try
            {
                _logger.LogInformation("Starting migration of KhuyenMai images to Supabase");
                
                var result = await _migrationService.MigrateKhuyenMaiImagesAsync();
                
                return Ok(new
                {
                    message = "KhuyenMai images migration completed",
                    totalItems = result.TotalItems,
                    successCount = result.SuccessCount,
                    failureCount = result.FailureCount,
                    errors = result.Errors,
                    successMessages = result.SuccessMessages
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during KhuyenMai images migration");
                return StatusCode(500, new { message = "KhuyenMai migration failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Clean up old image paths and set them to NULL (for items without actual files)
        /// </summary>
        [HttpPost("cleanup-missing-images")]
        public async Task<IActionResult> CleanupMissingImages()
        {
            try
            {
                _logger.LogInformation("Starting cleanup of missing image paths");
                
                var result = await _migrationService.CleanupMissingImagesAsync();
                
                return Ok(new
                {
                    message = "Cleanup completed",
                    totalItems = result.TotalItems,
                    successCount = result.SuccessCount,
                    failureCount = result.FailureCount,
                    errors = result.Errors,
                    successMessages = result.SuccessMessages
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during image cleanup");
                return StatusCode(500, new { message = "Cleanup failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload image for DichVu and save to Supabase
        /// </summary>
        [HttpPost("upload-dichvu-image/{maDichVu}")]
        public async Task<IActionResult> UploadDichVuImage(string maDichVu, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "No file uploaded" });

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Invalid file type. Only images are allowed." });

                // Find DichVu
                var dichVu = await _context.DichVus.FindAsync(maDichVu);
                if (dichVu == null)
                    return NotFound(new { message = "DichVu not found" });

                // Upload to Supabase
                var supabaseUrl = await _supabaseStorage.UploadFileAsync(file, "services");

                // Update database
                dichVu.Thumbnail = supabaseUrl;
                dichVu.NgaySua = DateTime.Now;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Uploaded image for DichVu {maDichVu} to Supabase: {supabaseUrl}");

                return Ok(new
                {
                    message = "Image uploaded successfully",
                    maDichVu = maDichVu,
                    imageUrl = supabaseUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading image for DichVu {maDichVu}");
                return StatusCode(500, new { message = "Upload failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload image for KhuyenMai and save to Supabase
        /// </summary>
        [HttpPost("upload-khuyenmai-image/{maKm}")]
        public async Task<IActionResult> UploadKhuyenMaiImage(string maKm, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "No file uploaded" });

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Invalid file type. Only images are allowed." });

                // Find KhuyenMai
                var khuyenMai = await _context.KhuyenMais.FindAsync(maKm);
                if (khuyenMai == null)
                    return NotFound(new { message = "KhuyenMai not found" });

                // Upload to Supabase
                var supabaseUrl = await _supabaseStorage.UploadFileAsync(file, "promotions");

                // Update database
                khuyenMai.Thumbnail = supabaseUrl;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Uploaded image for KhuyenMai {maKm} to Supabase: {supabaseUrl}");

                return Ok(new
                {
                    message = "Image uploaded successfully",
                    maKm = maKm,
                    imageUrl = supabaseUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading image for KhuyenMai {maKm}");
                return StatusCode(500, new { message = "Upload failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all items that need images (NULL thumbnails)
        /// </summary>
        [HttpGet("items-without-images")]
        public async Task<IActionResult> GetItemsWithoutImages()
        {
            try
            {
                var dichVusWithoutImages = await _context.DichVus
                    .Where(dv => string.IsNullOrEmpty(dv.Thumbnail))
                    .Select(dv => new { 
                        Type = "DichVu",
                        Id = dv.MaDichVu, 
                        Name = dv.TenDichVu,
                        Description = dv.MoTa
                    })
                    .ToListAsync();

                var khuyenMaisWithoutImages = await _context.KhuyenMais
                    .Where(km => string.IsNullOrEmpty(km.Thumbnail))
                    .Select(km => new { 
                        Type = "KhuyenMai",
                        Id = km.MaKm, 
                        Name = km.TenKhuyenMai,
                        Description = km.MoTa
                    })
                    .ToListAsync();

                var allItems = dichVusWithoutImages.Concat(khuyenMaisWithoutImages).ToList();

                return Ok(new
                {
                    message = "Items without images retrieved successfully",
                    totalItems = allItems.Count,
                    dichVuCount = dichVusWithoutImages.Count,
                    khuyenMaiCount = khuyenMaisWithoutImages.Count,
                    items = allItems
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving items without images");
                return StatusCode(500, new { message = "Failed to retrieve items", error = ex.Message });
            }
        }

        /// <summary>
        /// Test endpoint to check if Migration controller is working
        /// </summary>
        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { 
                message = "Migration Controller is working!", 
                timestamp = DateTime.Now,
                endpoints = new[]
                {
                    "POST /api/Migration/migrate-all-images",
                    "POST /api/Migration/migrate-dichvu-images", 
                    "POST /api/Migration/migrate-khuyenmai-images",
                    "POST /api/Migration/cleanup-missing-images",
                    "POST /api/Migration/upload-dichvu-image/{maDichVu}",
                    "POST /api/Migration/upload-khuyenmai-image/{maKm}",
                    "GET /api/Migration/items-without-images"
                }
            });
        }
    }
}