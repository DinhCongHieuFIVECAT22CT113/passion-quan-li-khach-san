# 🚀 Hướng dẫn Migration từ Local Storage sang Supabase Storage

## 📋 Tổng quan
Hệ thống đã được cập nhật để sử dụng **Supabase Storage** thay vì lưu trữ file local. Điều này mang lại:
- ✅ Khả năng mở rộng tốt hơn
- ✅ Backup tự động
- ✅ CDN global
- ✅ Bảo mật cao hơn
- ✅ Không lo về dung lượng server

## 🔧 Các thay đổi đã thực hiện

### Backend Changes:
1. **Thêm Supabase package** và cấu hình
2. **Tạo SupabaseStorageService** để quản lý file upload/delete
3. **Cập nhật WriteFileRepository** để sử dụng Supabase
4. **Cập nhật DTOs** để hỗ trợ cả file upload và URL
5. **Cập nhật Repository** (DichVu, KhuyenMai) để xử lý file upload
6. **Tạo Migration Service** để migrate hình ảnh cũ
7. **Tạo Migration Controller** để chạy migration

### Frontend Changes:
1. **Tạo config file** cho Supabase
2. **Helper functions** để xử lý image URLs

## 🚀 Hướng dẫn Setup

### Bước 1: Setup Supabase Storage
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard/project/ttumqjufzmvfkccnyxfx)
2. Vào **Storage** → **Create new bucket**
3. Bucket name: `hotel-images`
4. Public: ✅ (checked)
5. Vào **SQL Editor** và chạy script:

```sql
-- Tạo bucket cho hình ảnh khách sạn (nếu chưa có)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-images', 'hotel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Tạo policy cho phép public read
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'hotel-images');

-- Tạo policy cho phép authenticated upload
CREATE POLICY "Authenticated upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'hotel-images');

-- Tạo policy cho phép authenticated update
CREATE POLICY "Authenticated update access" ON storage.objects
FOR UPDATE USING (bucket_id = 'hotel-images');

-- Tạo policy cho phép authenticated delete
CREATE POLICY "Authenticated delete access" ON storage.objects
FOR DELETE USING (bucket_id = 'hotel-images');
```

### Bước 2: Chạy Backend
```bash
cd "backend/be-quanlikhachsanapi"
dotnet run
```

### Bước 3: Migration hình ảnh cũ (Chỉ Admin)
1. **Đăng nhập với tài khoản Admin** (Role R00)
2. **Gọi API Migration**:

```bash
# Migrate tất cả hình ảnh
POST /api/Migration/migrate-all-images

# Hoặc migrate từng loại
POST /api/Migration/migrate-dichvu-images
POST /api/Migration/migrate-khuyenmai-images
```

3. **Kiểm tra kết quả** trong response để xem có lỗi gì không

## 📝 Cách sử dụng mới

### Backend API:

#### 1. Tạo Dịch Vụ với file upload:
```bash
POST /api/DichVu
Content-Type: multipart/form-data

{
  "TenDichVu": "Spa",
  "ThumbnailFile": [FILE],  # Upload file trực tiếp
  "MoTa": "Dịch vụ spa cao cấp",
  "DonGia": 500000
}
```

#### 2. Tạo Dịch Vụ với URL:
```bash
POST /api/DichVu
Content-Type: application/json

{
  "TenDichVu": "Spa",
  "Thumbnail": "https://ttumqjufzmvfkccnyxfx.supabase.co/storage/v1/object/public/hotel-images/services/image.jpg",
  "MoTa": "Dịch vụ spa cao cấp", 
  "DonGia": 500000
}
```

#### 3. Cập nhật với file mới:
```bash
PUT /api/DichVu/{id}
Content-Type: multipart/form-data

{
  "TenDichVu": "Spa Updated",
  "ThumbnailFile": [NEW_FILE],  # File mới sẽ thay thế file cũ
  "MoTa": "Dịch vụ spa cao cấp updated",
  "DonGia": 600000
}
```

### Frontend Usage:

#### 1. Import helper functions:
```javascript
import { getImageUrl, supabaseConfig } from '../config/supabase.js';
```

#### 2. Hiển thị hình ảnh:
```javascript
// Thay vì:
<img src={`${API_URL}/${dichVu.thumbnail}`} />

// Sử dụng:
<img src={getImageUrl(dichVu.thumbnail)} />
```

#### 3. Upload file:
```javascript
const formData = new FormData();
formData.append('TenDichVu', 'Spa Service');
formData.append('ThumbnailFile', selectedFile);
formData.append('MoTa', 'Description');
formData.append('DonGia', 500000);

fetch('/api/DichVu', {
  method: 'POST',
  body: formData
});
```

## 🔍 Kiểm tra Migration

### 1. Kiểm tra Supabase Storage:
- Vào [Storage Dashboard](https://supabase.com/dashboard/project/ttumqjufzmvfkccnyxfx/storage/buckets)
- Xem bucket `hotel-images` có chứa các folder:
  - `services/` (cho DichVu)
  - `promotions/` (cho KhuyenMai)

### 2. Kiểm tra Database:
```sql
-- Kiểm tra DichVu URLs
SELECT MaDichVu, TenDichVu, Thumbnail 
FROM DichVus 
WHERE Thumbnail LIKE '%supabase.co%';

-- Kiểm tra KhuyenMai URLs  
SELECT MaKm, TenKhuyenMai, Thumbnail
FROM KhuyenMais
WHERE Thumbnail LIKE '%supabase.co%';
```

### 3. Test Upload mới:
- Tạo DichVu/KhuyenMai mới với file upload
- Kiểm tra file có xuất hiện trong Supabase Storage
- Kiểm tra URL trong database có đúng format

## ⚠️ Lưu ý quan trọng

### 1. Backup trước khi Migration:
```bash
# Backup database
sqlcmd -S server -d database -E -Q "BACKUP DATABASE [database] TO DISK='backup.bak'"

# Backup thư mục UpLoad
xcopy "UpLoad" "UpLoad_Backup" /E /I
```

### 2. Rollback nếu cần:
- Restore database từ backup
- Cập nhật lại code để sử dụng local storage
- Copy lại thư mục UpLoad_Backup

### 3. Monitoring:
- Theo dõi logs trong Supabase Dashboard
- Kiểm tra usage và bandwidth
- Monitor API response times

## 🐛 Troubleshooting

### 1. Lỗi "Bucket not found":
```bash
# Kiểm tra bucket đã tạo chưa
SELECT * FROM storage.buckets WHERE id = 'hotel-images';
```

### 2. Lỗi "Permission denied":
```bash
# Kiểm tra policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### 3. Lỗi upload file:
- Kiểm tra file size (max 50MB)
- Kiểm tra file type (jpg, png, gif, webp)
- Kiểm tra network connection

### 4. Migration thất bại:
- Kiểm tra đường dẫn file local
- Kiểm tra permissions thư mục UpLoad
- Xem logs chi tiết trong API response

## 📊 Monitoring & Analytics

### Supabase Dashboard:
1. **Storage Usage**: Theo dõi dung lượng sử dụng
2. **API Calls**: Monitor số lượng request
3. **Bandwidth**: Theo dõi traffic
4. **Logs**: Xem logs real-time

### Backend Logs:
```bash
# Xem logs migration
grep "Migration" logs/app.log

# Xem logs upload
grep "Upload" logs/app.log
```

## 🎯 Kết luận

Sau khi hoàn thành migration:
- ✅ Tất cả hình ảnh mới sẽ được lưu trên Supabase
- ✅ Hình ảnh cũ đã được migrate (nếu chạy migration)
- ✅ Hệ thống hoạt động bình thường với storage mới
- ✅ Có thể xóa thư mục UpLoad local (sau khi backup)

**Liên hệ**: Nếu có vấn đề gì trong quá trình migration, hãy kiểm tra logs và troubleshooting guide trên.