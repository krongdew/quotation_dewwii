// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

// ฟังก์ชันสำหรับส่งอีเมล์
async function sendResetEmail(email: string, resetToken: string) {
  try {
    // ควรเก็บข้อมูลเหล่านี้ใน .env
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Quotation System" <your-email@gmail.com>',
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - ระบบใบเสนอราคา',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>รีเซ็ตรหัสผ่าน</h2>
          <p>คุณได้รับอีเมล์นี้เนื่องจากมีการขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณในระบบใบเสนอราคา</p>
          <p>กรุณาคลิกที่ลิงค์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">รีเซ็ตรหัสผ่าน</a>
          </p>
          <p>ลิงค์นี้จะหมดอายุใน 1 ชั่วโมง</p>
          <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมล์นี้</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// API สำหรับขอรีเซ็ตรหัสผ่าน
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // ค้นหาผู้ใช้จากอีเมล์
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // แม้ว่าจะไม่พบผู้ใช้ แต่เราจะไม่เปิดเผยข้อมูลนี้เพื่อความปลอดภัย
    if (!user) {
      return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link' });
    }

    // สร้าง token สำหรับการรีเซ็ตรหัสผ่าน
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // บันทึก token ลงในฐานข้อมูล
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // ส่งอีเมล์
    const emailResult = await sendResetEmail(email, resetToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link' });
  } catch (error) {
    console.error('Reset password request error:', error);
    return NextResponse.json(
      { error: 'An error occurred during reset password request' },
      { status: 500 }
    );
  }
}

// API สำหรับทำการรีเซ็ตรหัสผ่าน
export async function PUT(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // ค้นหาผู้ใช้จาก token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()  // token ยังไม่หมดอายุ
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await hashPassword(password);

    // อัพเดตรหัสผ่านและล้าง token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred during password reset' },
      { status: 500 }
    );
  }
}