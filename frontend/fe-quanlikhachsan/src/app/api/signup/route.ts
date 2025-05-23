import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userName,
      password,
      confirmPassword,
      email,
      hokh,
      tenkh,
      soCccd,
      soDienThoai
    } = body;

    const errors: Record<string, string> = {};

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
    const validatePhone = (phone: string) => /^\d{10,11}$/.test(phone);
    const validateCCCD = (cccd: string) => /^\d{9,12}$/.test(cccd);

    if (!userName.trim()) errors.userName = 'Tên đăng nhập bắt buộc';
    if (!validateEmail(email)) errors.email = 'Email không hợp lệ';
    if (!validatePassword(password)) errors.password = 'Mật khẩu không đủ mạnh';
    if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!hokh.trim()) errors.hokh = 'Họ khách hàng bắt buộc';
    if (!tenkh.trim()) errors.tenkh = 'Tên khách hàng bắt buộc';
    if (!validateCCCD(soCccd)) errors.soCccd = 'CCCD không hợp lệ';
    if (!validatePhone(soDienThoai)) errors.soDienThoai = 'Số điện thoại không hợp lệ';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }
    // - Kiểm tra trùng email/username trong DB
    // - Lưu user vào database
    // - Gửi email xác nhận
    console.log("New user data:", body);

    return NextResponse.json({ success: true, message: 'Đăng ký thành công!' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
