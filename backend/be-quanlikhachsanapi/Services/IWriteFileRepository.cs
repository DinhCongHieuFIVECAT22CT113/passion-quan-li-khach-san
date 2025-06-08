namespace be_quanlikhachsanapi.Services
{
    public interface IWriteFileRepository
    {
        Task<List<string>> WriteFileAsync(List<IFormFile> files, string folder);
        Task<string> WriteFileAsync(IFormFile file, string folder);
        Task<bool> DeleteFileAsync(string filePath);
    }
    
    public class WriteFileRepository : IWriteFileRepository
    {
        private readonly ISupabaseStorageService _supabaseStorage;
        private readonly ILogger<WriteFileRepository> _logger;

        public WriteFileRepository(ISupabaseStorageService supabaseStorage, ILogger<WriteFileRepository> logger)
        {
            _supabaseStorage = supabaseStorage;
            _logger = logger;
        }

        public async Task<List<string>> WriteFileAsync(List<IFormFile> files, string? folder = null)
        {
            try
            {
                var validFiles = new List<IFormFile>();
                var errorMessages = new List<string>();

                // Validate files first
                foreach (var file in files)
                {
                    if (file.Length == 0)
                    {
                        continue;
                    }

                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                    if (extension == ".jpg" || extension == ".jpeg" || extension == ".png" || extension == ".gif" || extension == ".webp")
                    {
                        validFiles.Add(file);
                    }
                    else if (extension == ".pdf" || extension == ".doc" || extension == ".docx" || extension == ".xls" || extension == ".xlsx")
                    {
                        validFiles.Add(file);
                    }
                    else
                    {
                        errorMessages.Add($"File không hợp lệ '{file.FileName}'.");
                    }
                }

                if (errorMessages.Any())
                {
                    throw new Exception(string.Join(Environment.NewLine, errorMessages));
                }

                // Upload to Supabase
                var uploadedUrls = await _supabaseStorage.UploadFilesAsync(validFiles, folder ?? "general");
                
                _logger.LogInformation($"Successfully uploaded {uploadedUrls.Count} files to Supabase");
                return uploadedUrls;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in WriteFileAsync");
                throw;
            }
        }

        public async Task<string> WriteFileAsync(IFormFile file, string? folder = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    throw new ArgumentException("File không hợp lệ");
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!(extension == ".jpg" || extension == ".jpeg" || extension == ".png" || extension == ".gif" || extension == ".webp" ||
                      extension == ".pdf" || extension == ".doc" || extension == ".docx" || extension == ".xls" || extension == ".xlsx"))
                {
                    throw new ArgumentException($"File không hợp lệ '{file.FileName}'.");
                }

                // Upload to Supabase
                var uploadedUrl = await _supabaseStorage.UploadFileAsync(file, folder ?? "general");
                
                _logger.LogInformation($"Successfully uploaded file {file.FileName} to Supabase");
                return uploadedUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading file {file?.FileName}");
                throw;
            }
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            try
            {
                return await _supabaseStorage.DeleteFileAsync(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting file {filePath}");
                return false;
            }
        }
    }
}