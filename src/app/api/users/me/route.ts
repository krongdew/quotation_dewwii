// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// ดึงข้อมูลผู้ใช้ปัจจุบัน
export async function GET(req: NextRequest) {
  return withAuth(async (request: NextRequest & { user: any }) => {
    try {
      const userId = request.user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return NextResponse.json(
        { error: 'An error occurred while fetching user data' },
        { status: 500 }
      );
    }
  })(req);
}