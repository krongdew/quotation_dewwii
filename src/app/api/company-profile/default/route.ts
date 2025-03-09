//quotation-system/src/app/api/company-profile/default/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const defaultProfile = await prisma.companyProfile.findFirst({
      where: { isDefault: true },
    });
    
    if (!defaultProfile) {
      // ถ้าไม่พบค่าเริ่มต้น ให้ดึงอันแรกมาแทน
      const firstProfile = await prisma.companyProfile.findFirst();
      
      if (!firstProfile) {
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลบริษัท กรุณาสร้างข้อมูลบริษัทก่อน' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(firstProfile);
    }
    
    return NextResponse.json(defaultProfile);
  } catch (error) {
    console.error('Error fetching default company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัท' },
      { status: 500 }
    );
  }
}