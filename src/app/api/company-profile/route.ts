//quotation-system/src/app/api/company-profile/route.ts
import { NextResponse } from 'next/server';
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
    const body = await request.json();
    const { companyName, address, phoneNumber, email, taxId, contactPerson, logo, isDefault } = body;
    
    // ถ้าตั้งเป็นค่าเริ่มต้น ให้ยกเลิกค่าเริ่มต้นของรายการอื่น
    if (isDefault) {
      await prisma.companyProfile.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }
    
    const profile = await prisma.companyProfile.create({
      data: {
        companyName,
        address,
        phoneNumber,
        email,
        taxId,
        contactPerson,
        logo,
        isDefault
      },
    });
    
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error creating company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างข้อมูลบริษัท' },
      { status: 500 }
    );
  }
}