namespace be_quanlikhachsanapi.Services
{
    public interface IWriteFileRepository
    {
        Task<List<string>> WriteFileAsync(List<IFormFile> files, string folder);
    }
    public class WriteFileRepository : IWriteFileRepository
    {
        public async Task<List<string>> WriteFileAsync(List<IFormFile> files, string? folder = null)
        {
            string local;

            var imageUrls = new List<string>();
            var errorMessages = new List<string>(); // Danh sách để lưu trữ thông báo lỗi
            foreach (var file in files)
            {
                if (file.Length == 0)
                {
                    continue;
                }

                var extension = "." + file.FileName.Split('.')[file.FileName.Split('.').Length - 1];

                if (extension == ".jpg" || extension == ".jpge" || extension == ".png")
                {
                    local = "Images";
                }
                else if (extension == ".pdf" || extension == ".doc" || extension == ".docx" || extension == ".xls" || extension == ".xlsx")
                {
                    local = "Files";
                }
                else
                {
                    // Nếu extension không hợp lệ, thêm thông báo lỗi vào danh sách và chuyển sang file tiếp theo
                    errorMessages.Add($"File không hợp lệ '{file.FileName}'.");
                    continue;
                }

                try
                {
                    var exactpath = Path.Combine(Directory.GetCurrentDirectory(),
                        "UpLoad\\" + local + "\\" + folder + "", file.FileName);

                    var stream = new FileStream(exactpath, FileMode.Create);

                    await file.CopyToAsync(stream);

                    stream.Close();

                    string result = "Upload/" + local + "/" + folder + "/" + file.FileName;

                    imageUrls.Add(result);
                }
                catch (Exception ex)
                {
                    errorMessages.Add($"Lỗi khi upload file '{file.FileName}': {ex.Message}");
                }
            }
            // Kiểm tra nếu có lỗi, trả về danh sách thông báo lỗi
            if (errorMessages.Count > 0)
            {
                throw new Exception(string.Join(Environment.NewLine, errorMessages));
            }

            return imageUrls;
        }
    }
}