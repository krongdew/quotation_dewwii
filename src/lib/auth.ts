// src/lib/auth.ts
import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ตั้งค่า Secret Keys (ควรเก็บใน .env)
// ตั้งค่า Secret Keys (ควรเก็บใน .env)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
// เพิ่มตัวแปร TEMP_SECRET ที่หายไป
const TEMP_SECRET = 'test-secret-key-1234567890';;


// ฟังก์ชันสำหรับเข้ารหัสรหัสผ่าน
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

// ฟังก์ชันสำหรับตรวจสอบรหัสผ่าน
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// สร้าง JWT Token
export function createToken(payload: any): string {
  return jwt.sign(payload, TEMP_SECRET, { expiresIn: '1d' });
}

// ตรวจสอบและถอดรหัส JWT Token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, TEMP_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Middleware function สำหรับตรวจสอบการเข้าถึง API
export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // เพิ่มข้อมูลผู้ใช้ลงใน request
    const request = req as NextRequest & { user: any };
    (request as any).user = decoded;

    return handler(request);
  };
}

// ฟังก์ชันสำหรับตรวจสอบสิทธิ์ของผู้ใช้งาน
export function withRole(handler: Function, roles: string[]) {
  return withAuth(async (req: NextRequest & { user: any }) => {
    if (!roles.includes(req.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

// ฟังก์ชันสำหรับตั้งค่า cookie token
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}


// ฟังก์ชันสำหรับลบ cookie token
export async function clearAuthCookie() {
  (await cookies()).delete('auth_token');
}