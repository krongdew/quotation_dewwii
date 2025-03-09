// src/app/api/company-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const profiles = await prisma.companyProfile.findMany();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching company profiles:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัท' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // อ่านข้อมูลจาก request
    const body = await request.json();
    console.log('POST request body:', body);  // เพิ่ม log เพื่อตรวจสอบข้อมูลที่ส่งมา
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.companyName) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อบริษัท' },
        { status: 400 }
      );
    }
    
    if (!body.contactPerson) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อผู้ติดต่อ' },
        { status: 400 }
      );
    }
    
    if (!body.address) {
      return NextResponse.json(
        { error: 'กรุณากรอกที่อยู่บริษัท' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่าต้องการตั้งเป็นค่าเริ่มต้นหรือไม่
    const isDefault = body.isDefault || false;
    
    // ถ้าตั้งเป็นค่าเริ่มต้น ให้ยกเลิกค่าเริ่มต้นของรายการอื่น
    if (isDefault) {
      await prisma.companyProfile.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }
    
    // ถ้ายังไม่มีข้อมูลบริษัทในระบบ ให้ตั้งเป็นค่าเริ่มต้น
    const count = await prisma.companyProfile.count();
    if (count === 0) {
      body.isDefault = true;
    }
    
    // สร้างข้อมูลบริษัท
    try {
      const profile = await prisma.companyProfile.create({
        data: {
          companyName: body.companyName,
          address: body.address,
          phoneNumber: body.phoneNumber || "",  // ใช้ string ว่างแทน null
          email: body.email || "",              // ใช้ string ว่างแทน null
          taxId: body.taxId || "",              // ใช้ string ว่างแทน null
          contactPerson: body.contactPerson,
          logo: body.logo,
          signature: body.signature,
          isDefault: body.isDefault || false,
        },
      });
      
      return NextResponse.json(profile, { status: 201 });
    } catch (prismaError: any) {
      console.error('Prisma error:', prismaError);
      
      // ตรวจสอบ Prisma error
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'มีข้อมูลบริษัทนี้ในระบบแล้ว' },
          { status: 409 }
        );
      }
      
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error creating company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างข้อมูลบริษัท: ' + (error.message || '') },
      { status: 500 }
    );
  }
}