//quotation-system/src/app/api/customers/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า' },
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
    
    // สร้างข้อมูลลูกค้า
    try {
      const customer = await prisma.customer.create({
        data: {
          companyName: body.companyName,
          address: body.address,
          phoneNumber: body.phoneNumber || "",  // เปลี่ยนจาก null เป็น ""
          email: body.email || "",              // เปลี่ยนจาก null เป็น ""
          taxId: body.taxId || "",              // เปลี่ยนจาก null เป็น ""
          contactPerson: body.contactPerson,
        },
      });
      
      return NextResponse.json(customer, { status: 201 });
    } catch (prismaError: any) {
      console.error('Prisma error:', prismaError);
      
      // ตรวจสอบ Prisma error
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'มีข้อมูลลูกค้านี้ในระบบแล้ว' },
          { status: 409 }
        );
      }
      
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างข้อมูลลูกค้า: ' + (error.message || '') },
      { status: 500 }
    );
  }
}