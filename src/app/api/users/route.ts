// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, withRole, withAuth } from '@/lib/auth';

// ดึงข้อมูลผู้ใช้ทั้งหมด (เฉพาะ admin)
export async function GET(req: NextRequest) {
  return withRole(async () => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          active: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      return NextResponse.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'An error occurred while fetching users' },
        { status: 500 }
      );
    }
  }, ['ADMIN'])(req);
}

// เพิ่มผู้ใช้ใหม่ (เฉพาะ admin)
export async function POST(req: NextRequest) {
  return withRole(async () => {
    try {
      const { email, displayName, role, active = true } = await req.json();
      
      // ตรวจสอบความถูกต้องของข้อมูล
      if (!email || !displayName) {
        return NextResponse.json(
          { error: 'Email and displayName are required' },
          { status: 400 }
        );
      }
      
      // ตรวจสอบว่ามีอีเมล์นี้อยู่แล้วหรือไม่
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      
      // สร้างรหัสผ่านชั่วคราว
      const temporaryPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(temporaryPassword);
      
      // สร้างผู้ใช้ใหม่
      const newUser = await prisma.user.create({
        data: {
          email,
          displayName,
          password: hashedPassword,
          role: role || 'USER',
          active
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          active: true,
          createdAt: true
        }
      });
      
      // สร้าง token สำหรับรีเซ็ตรหัสผ่านและส่งอีเมล์ให้ผู้ใช้ใหม่
      // ใช้ API reset-password ที่มีอยู่แล้ว
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      return NextResponse.json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'An error occurred while creating user' },
        { status: 500 }
      );
    }
  }, ['ADMIN'])(req);
}