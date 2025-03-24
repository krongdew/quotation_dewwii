// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, withAuth, withRole } from '@/lib/auth';

// ดึงข้อมูลผู้ใช้เดี่ยว
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (request: NextRequest & { user: any }) => {
    try {
      const { id } = params;
      
      // ตรวจสอบว่าเป็น admin หรือเจ้าของบัญชี
      if (request.user.role !== 'ADMIN' && request.user.id !== id) {
        return NextResponse.json(
          { error: 'Unauthorized: You can only view your own profile' },
          { status: 403 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id },
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
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'An error occurred while fetching user' },
        { status: 500 }
      );
    }
  })(req);
}

// อัพเดตข้อมูลผู้ใช้
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (request: NextRequest & { user: any }) => {
    try {
      const { id } = params;
      const { displayName, active, role } = await req.json();
      
      // ตรวจสอบว่าเป็น admin หรือเจ้าของบัญชี
      const isAdmin = request.user.role === 'ADMIN';
      
      if (!isAdmin && request.user.id !== id) {
        return NextResponse.json(
          { error: 'Unauthorized: You can only update your own profile' },
          { status: 403 }
        );
      }
      
      // ตรวจสอบผู้ใช้ที่ต้องการอัพเดต
      const userToUpdate = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!userToUpdate) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // ป้องกันการแก้ไข email ของ admin ตามที่ระบุในข้อกำหนด
      if (userToUpdate.email === 'dewwiisunny14@gmail.com' && !active) {
        return NextResponse.json(
          { error: 'Cannot deactivate admin account' },
          { status: 403 }
        );
      }
      
      // เตรียมข้อมูลที่จะอัพเดต
      const updateData: any = {};
      
      if (displayName !== undefined) {
        updateData.displayName = displayName;
      }
      
      // เฉพาะ admin ที่สามารถอัพเดต role และ active ได้
      if (isAdmin) {
        if (role !== undefined) {
          updateData.role = role;
        }
        
        if (active !== undefined) {
          updateData.active = active;
        }
      }
      
      // อัพเดตข้อมูล
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          active: true,
          lastLogin: true,
          updatedAt: true
        }
      });
      
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'An error occurred while updating user' },
        { status: 500 }
      );
    }
  })(req);
}

// ลบผู้ใช้ (เฉพาะ admin)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withRole(async () => {
    try {
      const { id } = params;
      
      // ตรวจสอบผู้ใช้ที่ต้องการลบ
      const userToDelete = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!userToDelete) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // ป้องกันการลบ admin ตามที่ระบุในข้อกำหนด
      if (userToDelete.email === 'dewwiisunny14@gmail.com') {
        return NextResponse.json(
          { error: 'Cannot delete admin account' },
          { status: 403 }
        );
      }
      
      // ลบผู้ใช้
      await prisma.user.delete({
        where: { id }
      });
      
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'An error occurred while deleting user' },
        { status: 500 }
      );
    }
  }, ['ADMIN'])(req);
}

// เปลี่ยนรหัสผ่าน
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (request: NextRequest & { user: any }) => {
    try {
      const { id } = params;
      const { currentPassword, newPassword } = await req.json();
      
      // ตรวจสอบว่าเป็นเจ้าของบัญชี
      if (request.user.id !== id) {
        return NextResponse.json(
          { error: 'Unauthorized: You can only change your own password' },
          { status: 403 }
        );
      }
      
      // ตรวจสอบข้อมูล
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        );
      }
      
      // ตรวจสอบผู้ใช้
      const user = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // ตรวจสอบรหัสผ่านปัจจุบัน
      const { verifyPassword } = await import('@/lib/auth');
      const isPasswordValid = await verifyPassword(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }
      
      // เข้ารหัสรหัสผ่านใหม่
      const hashedPassword = await hashPassword(newPassword);
      
      // อัพเดตรหัสผ่าน
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword }
      });
      
      return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      return NextResponse.json(
        { error: 'An error occurred while changing password' },
        { status: 500 }
      );
    }
  })(req);
}