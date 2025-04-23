import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (email === 'user@example.com' && password === 'string') {
      return NextResponse.json({
        success: true,
        user: {
          id: 1,
          email,
          name: 'Example User'
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
