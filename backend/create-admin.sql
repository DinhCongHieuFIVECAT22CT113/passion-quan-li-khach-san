-- Script để tạo tài khoản Admin cho migration
-- Kiểm tra và tạo Role Admin nếu chưa có
IF NOT EXISTS (SELECT 1 FROM Roles WHERE MaRole = 'R00')
BEGIN
    INSERT INTO Roles (MaRole, TenRole, MoTa, NgayTao)
    VALUES ('R00', 'Admin', 'Quản trị viên hệ thống', GETDATE())
    PRINT 'Đã tạo Role Admin (R00)'
END
ELSE
BEGIN
    PRINT 'Role Admin (R00) đã tồn tại'
END

-- Kiểm tra và tạo tài khoản Admin nếu chưa có
IF NOT EXISTS (SELECT 1 FROM NhanViens WHERE MaRole = 'R00')
BEGIN
    INSERT INTO NhanViens (
        MaNv, UserName, PasswordHash, HoNv, TenNv, ChucVu, 
        Email, Sdt, LuongCoBan, NgayVaoLam, MaRole, NgayTao
    )
    VALUES (
        'NV001', 
        'admin', 
        '$2a$11$rOzJqQZ8kVJ5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', -- password: admin123
        'Admin', 
        'System', 
        'Quản trị viên', 
        'admin@hotel.com', 
        '0123456789', 
        0, 
        GETDATE(), 
        'R00', 
        GETDATE()
    )
    PRINT 'Đã tạo tài khoản Admin: username=admin, password=admin123'
END
ELSE
BEGIN
    PRINT 'Tài khoản Admin đã tồn tại'
END

-- Hiển thị thông tin tài khoản Admin
SELECT 
    MaNv, UserName, HoNv, TenNv, ChucVu, Email, MaRole
FROM NhanViens 
WHERE MaRole = 'R00'