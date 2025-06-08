-- Debug script để kiểm tra Supabase Storage setup

-- 1. Kiểm tra bucket có tồn tại và public không
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'hotel-images';

-- 2. Kiểm tra các objects trong bucket
SELECT name, bucket_id, created_at, metadata
FROM storage.objects 
WHERE bucket_id = 'hotel-images'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Kiểm tra RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects';

-- 4. Kiểm tra RLS có được enable không
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects';

-- 5. Nếu cần, disable RLS tạm thời để test (KHÔNG khuyến khích cho production)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 6. Hoặc tạo policy đơn giản hơn
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'hotel-images');