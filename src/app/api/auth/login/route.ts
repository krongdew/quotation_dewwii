// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // ตรวจสอบว่ามีข้อมูลอีเมล์และรหัสผ่านหรือไม่
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ค้นหาผู้ใช้จากอีเมล์
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // ถ้าไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ถ้าผู้ใช้ไม่ active
    if (!user.active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });

    // อัพเดต lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

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
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}