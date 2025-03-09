import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const customer = await prisma.customer.findUnique({
      where: { id },
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลลูกค้า' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('PUT request body:', body);  // เพิ่ม log เพื่อตรวจสอบข้อมูลที่ส่งมา
    
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
    
    // อัปเดตข้อมูลลูกค้า
    try {
      // แก้ไขในไฟล์ customers/[id]/route.ts (PUT)
const customer = await prisma.customer.update({
  where: { id },
  data: {
    companyName: body.companyName,
    address: body.address,
    phoneNumber: body.phoneNumber || "",  // เปลี่ยนจาก null เป็น ""
    email: body.email || "",              // เปลี่ยนจาก null เป็น ""
    taxId: body.taxId || "",              // เปลี่ยนจาก null เป็น ""
    contactPerson: body.contactPerson,
  },
});
      
      return NextResponse.json(customer);
    } catch (prismaError: any) {
      console.error('Prisma error:', prismaError);
      
      // ตรวจสอบว่ามีข้อมูลที่จะอัปเดตหรือไม่
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลลูกค้าที่ต้องการอัปเดต' },
          { status: 404 }
        );
      }
      
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลลูกค้า: ' + (error.message || '') },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('Attempting to delete customer with ID:', id);
    
    // ตรวจสอบว่าลูกค้ามีอยู่หรือไม่
    const customer = await prisma.customer.findUnique({
      where: { id }
    });
    
    if (!customer) {
      console.log('Customer not found:', id);
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลลูกค้า' },
        { status: 404 }
      );
    }
    
    try {
      await prisma.customer.delete({
        where: { id },
      });
      
      console.log('Customer deleted successfully:', id);
      return new NextResponse(null, { status: 204 });
    } catch (prismaError: any) {
      console.error('Prisma error during delete:', prismaError);
      
      // ตรวจสอบ Foreign key constraint
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'ไม่สามารถลบข้อมูลลูกค้าที่มีการใช้งานอยู่ได้' },
          { status: 400 }
        );
      }
      
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูลลูกค้า: ' + (error.message || '') },
      { status: 500 }
    );
  }
}