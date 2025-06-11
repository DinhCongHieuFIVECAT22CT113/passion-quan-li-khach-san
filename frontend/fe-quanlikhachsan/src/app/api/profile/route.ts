import { NextResponse } from 'next/server';

// Mock user data (replace with real database in production)
const mockUserProfile = {
  userName: 'exampleUser',
  password: 'string',
  hokh: 'Nguyễn',
  tenkh: 'Văn A',
  email: 'user@example.com',
  soCccd: '123456789012',
  soDienThoai: '0987654321',
  paymentMethod: null as string | null,
  avatarSrc: null as string | null,
  coverPhotoSrc: null as string | null,
  diaChi: '' as string, // Thêm trường địa chỉ
};

export async function GET() {
  try {
    // In a real app, fetch the user's profile from the database
    // using an authenticated user ID (e.g., from a JWT token)
    return NextResponse.json({
      success: true,
      data: {
        hokh: mockUserProfile.hokh,
        tenkh: mockUserProfile.tenkh,
        email: mockUserProfile.email,
        soCccd: mockUserProfile.soCccd,
        soDienThoai: mockUserProfile.soDienThoai,
        paymentMethod: mockUserProfile.paymentMethod,
        avatarSrc: mockUserProfile.avatarSrc,
        coverPhotoSrc: mockUserProfile.coverPhotoSrc,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required' },
        { status: 400 }
      );
    }

if (action === 'updatePersonalInfo') {
  const { hokh, tenkh, email, soCccd, soDienThoai, diaChi } = data; // Thêm diaChi

  // Validation
  const errors: Record<string, string> = {};
  if (!hokh || hokh.trim() === '') errors.hokh = 'Họ không được để trống.';
  if (!tenkh || tenkh.trim() === '') errors.tenkh = 'Tên không được để trống.';
  if (!email || email.trim() === '') {
    errors.email = 'Email không được để trống.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email không đúng định dạng.';
  }
  if (!soDienThoai || soDienThoai.trim() === '') {
    errors.soDienThoai = 'Số điện thoại không được để trống.';
  } else if (!/^\d+$/.test(soDienThoai)) {
    errors.soDienThoai = 'Số điện thoại không hợp lệ.';
  }
  if (!soCccd || soCccd.trim() === '') {
    errors.soCccd = 'Số CCCD/CMND không được để trống.';
  } else if (!/^\d{12}$/.test(soCccd)) {
    errors.soCccd = 'Số CCCD/CMND phải có đúng 12 chữ số.';
  }
  // Validation cho diaChi (tùy chọn)
  if (diaChi && typeof diaChi !== 'string') {
    errors.diaChi = 'Địa chỉ không hợp lệ.';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { success: false, errors },
      { status: 400 }
    );
  }

  // Update mock data
  mockUserProfile.hokh = hokh;
  mockUserProfile.tenkh = tenkh;
  mockUserProfile.email = email;
  mockUserProfile.soCccd = soCccd;
  mockUserProfile.soDienThoai = soDienThoai;
  mockUserProfile.diaChi = diaChi || ''; // Lưu địa chỉ

  return NextResponse.json({
    success: true,
    message: 'Cập nhật thông tin thành công!',
    data: {
      hokh: mockUserProfile.hokh,
      tenkh: mockUserProfile.tenkh,
      email: mockUserProfile.email,
      soCccd: mockUserProfile.soCccd,
      soDienThoai: mockUserProfile.soDienThoai,
      diaChi: mockUserProfile.diaChi, // Trả về địa chỉ
    },
  });
}

    if (action === 'updatePaymentMethod') {
      const { paymentMethod, selectedCard } = data;

      if (!paymentMethod) {
        return NextResponse.json(
          { success: false, message: 'Phương thức thanh toán không được để trống.' },
          { status: 400 }
        );
      }

      if (paymentMethod === 'bank_transfer' && !selectedCard) {
        return NextResponse.json(
          { success: false, message: 'Vui lòng chọn ngân hàng hoặc thẻ.' },
          { status: 400 }
        );
      }

      // Update mock data (replace with database update in production)
      mockUserProfile.paymentMethod = paymentMethod === 'bank_transfer' ? selectedCard : paymentMethod;

      return NextResponse.json({
        success: true,
        message: 'Cập nhật phương thức thanh toán thành công!',
        data: {
          paymentMethod: mockUserProfile.paymentMethod,
        },
      });
    }

    if (action === 'updatePassword') {
      const { currentPassword, newPassword, confirmNewPassword } = data;

      const errors: Record<string, string> = {};
      if (!currentPassword) {
        errors.current = 'Vui lòng nhập mật khẩu hiện tại.';
      } else {
        // Trong môi trường thực tế, bạn sẽ kiểm tra mật khẩu bằng cách gọi API
        // Ở đây, chúng ta giả định mật khẩu hiện tại luôn đúng để tránh lỗi
        // Trong thực tế, bạn sẽ cần kiểm tra mật khẩu với backend
        // if (currentPassword !== mockUserProfile.password) {
        //   errors.current = 'Mật khẩu hiện tại không đúng.';
        // }
      }
      if (!newPassword) {
        errors.new = 'Vui lòng nhập mật khẩu mới.';
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(newPassword)) {
        errors.new = 'Mật khẩu phải có ít nhất 8 ký tự gồm chữ, số và ký tự đặc biệt.';
      }
      if (newPassword !== confirmNewPassword) {
        errors.confirm = 'Mật khẩu xác nhận không khớp.';
      }

      if (Object.keys(errors).length > 0) {
        return NextResponse.json(
          { success: false, errors },
          { status: 400 }
        );
      }

      // Update mock data (replace with database update in production)
      mockUserProfile.password = newPassword;

      return NextResponse.json({
        success: true,
        message: 'Đổi mật khẩu thành công!',
      });
    }

    if (action === 'updateAvatar' || action === 'updateCoverPhoto') {
      const { imageUrl } = data;

      if (!imageUrl || !imageUrl.trim()) {
        return NextResponse.json(
          { success: false, message: 'URL ảnh không được để trống.' },
          { status: 400 }
        );
      }

      // In a real app, you'd validate the URL and possibly store the image on a server
      if (action === 'updateAvatar') {
        mockUserProfile.avatarSrc = imageUrl;
      } else {
        mockUserProfile.coverPhotoSrc = imageUrl;
      }

      return NextResponse.json({
        success: true,
        message: action === 'updateAvatar' ? 'Cập nhật ảnh đại diện thành công!' : 'Cập nhật ảnh bìa thành công!',
        data: {
          [action === 'updateAvatar' ? 'avatarSrc' : 'coverPhotoSrc']: imageUrl,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Hành động không hợp lệ.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}