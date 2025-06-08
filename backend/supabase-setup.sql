-- Tạo bucket cho hình ảnh khách sạn (nếu chưa có)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-images', 'hotel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Xóa các policy cũ nếu có
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access" ON storage.objects;

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