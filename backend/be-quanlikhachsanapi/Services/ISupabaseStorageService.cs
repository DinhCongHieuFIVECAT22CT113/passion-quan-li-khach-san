using Supabase.Storage;

namespace be_quanlikhachsanapi.Services
{
    public interface ISupabaseStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string folder);
        Task<List<string>> UploadFilesAsync(List<IFormFile> files, string folder);
        Task<bool> DeleteFileAsync(string filePath);
        Task<string> GetPublicUrlAsync(string filePath);
        Task<bool> FileExistsAsync(string filePath);
    }

    public class SupabaseStorageService : ISupabaseStorageService
    {
        private readonly Supabase.Client _supabaseClient;
        private readonly string _bucketName;
        private readonly ILogger<SupabaseStorageService> _logger;

        public SupabaseStorageService(Supabase.Client supabaseClient, IConfiguration configuration, ILogger<SupabaseStorageService> logger)
        {
            _supabaseClient = supabaseClient;
            _bucketName = configuration["Supabase:BucketName"] ?? "hotel-images";
            _logger = logger;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folder)
        {
            try
            {
                if (file == null || file.Length == 0)
                    throw new ArgumentException("File không hợp lệ");

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(extension))
                    throw new ArgumentException($"Loại file không được hỗ trợ: {extension}");

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = string.IsNullOrEmpty(folder) ? fileName : $"{folder}/{fileName}";

                // Convert IFormFile to byte array
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();

                // Upload to Supabase Storage
                var result = await _supabaseClient.Storage
                    .From(_bucketName)
                    .Upload(fileBytes, filePath, new Supabase.Storage.FileOptions
                    {
                        ContentType = file.ContentType,
                        Upsert = false
                    });

                if (result == null)
                    throw new Exception("Upload thất bại");

                // Return public URL
                var publicUrl = _supabaseClient.Storage
                    .From(_bucketName)
                    .GetPublicUrl(filePath);

                _logger.LogInformation($"File uploaded successfully: {filePath}");
                return publicUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading file: {file?.FileName}");
                throw;
            }
        }

        public async Task<List<string>> UploadFilesAsync(List<IFormFile> files, string folder)
        {
            var uploadedUrls = new List<string>();
            var errors = new List<string>();

            foreach (var file in files)
            {
                try
                {
                    var url = await UploadFileAsync(file, folder);
                    uploadedUrls.Add(url);
                }
                catch (Exception ex)
                {
                    errors.Add($"Lỗi upload file '{file.FileName}': {ex.Message}");
                }
            }

            if (errors.Any())
            {
                // Cleanup uploaded files if there were errors
                foreach (var url in uploadedUrls)
                {
                    try
                    {
                        var filePath = ExtractFilePathFromUrl(url);
                        await DeleteFileAsync(filePath);
                    }
                    catch
                    {
                        // Ignore cleanup errors
                    }
                }
                throw new Exception(string.Join(Environment.NewLine, errors));
            }

            return uploadedUrls;
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                    return false;

                // If filePath is a full URL, extract the path part
                if (filePath.StartsWith("http"))
                {
                    filePath = ExtractFilePathFromUrl(filePath);
                }

                var result = await _supabaseClient.Storage
                    .From(_bucketName)
                    .Remove(new List<string> { filePath });

                _logger.LogInformation($"File deleted successfully: {filePath}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting file: {filePath}");
                return false;
            }
        }

        public async Task<string> GetPublicUrlAsync(string filePath)
        {
            try
            {
                var publicUrl = _supabaseClient.Storage
                    .From(_bucketName)
                    .GetPublicUrl(filePath);

                return publicUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting public URL for: {filePath}");
                throw;
            }
        }

        public async Task<bool> FileExistsAsync(string filePath)
        {
            try
            {
                var files = await _supabaseClient.Storage
                    .From(_bucketName)
                    .List(Path.GetDirectoryName(filePath) ?? "");

                return files.Any(f => f.Name == Path.GetFileName(filePath));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking file existence: {filePath}");
                return false;
            }
        }

        private string ExtractFilePathFromUrl(string url)
        {
            // Extract file path from Supabase public URL
            // URL format: https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file
            var uri = new Uri(url);
            var segments = uri.Segments;
            
            // Find the bucket name segment and get everything after it
            var bucketIndex = Array.FindIndex(segments, s => s.TrimEnd('/') == _bucketName);
            if (bucketIndex >= 0 && bucketIndex < segments.Length - 1)
            {
                return string.Join("", segments.Skip(bucketIndex + 1)).TrimStart('/');
            }

            // Fallback: assume the last part of the path is the file path
            return Path.GetFileName(url);
        }
    }
}