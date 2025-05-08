import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userName, password } = await req.json();

    // Basic validation
    if (!userName || !userName.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Tên tài khoản không được để trống'
      }, { status: 400 });
    }

    if (!password || !password.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Mật khẩu không được để trống'
      }, { status: 400 });
    }

    // Mock login logic: Replace with real database check in production
    if (userName === 'exampleUser' && password === 'string') {
      return NextResponse.json({
        success: true,
        user: {
          id: 1,
          userName,
          name: 'Example User'
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Tên tài khoản hoặc mật khẩu không đúng'
    }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}