//src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log('Login attempt for:', email);

    // ตรวจสอบว่ามีข้อมูลอีเมล์และรหัสผ่านหรือไม่
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ค้นหาผู้ใช้จากอีเมล์
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log('User found:', !!user);

    // ถ้าไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ถ้าผู้ใช้ไม่ active
    if (!user.active) {
      console.log('User is inactive');
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    // สร้าง token
    const token = createToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });
    console.log('Token created successfully');

    // อัพเดต lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    console.log('Last login updated');

    // สร้าง response
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });
    
    // ตั้งค่า cookie ใน response
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // ถ้าใช้งานบน production บนโดเมนเฉพาะ ให้ลบคอมเม้นต์บรรทัดนี้
      // domain: process.env.NEXT_PUBLIC_DOMAIN || undefined,
    });
    
    console.log('Login successful, cookie set');
    return response;
  } catch (error) {
    console.error('Login error detail:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}