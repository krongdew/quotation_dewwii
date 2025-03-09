// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

type Params = {
  params: {
    id: string;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('GET request for company profile id:', id);
    
    const profile = await prisma.companyProfile.findUnique({
      where: { id },
    });
    
    if (!profile) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลบริษัท' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัท' },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  context: Params
) {
  try {
    const id = context.params.id;
    const body = await request.json();
    console.log('PUT request body:', body);  // เพิ่ม log เพื่อตรวจสอบข้อมูลที่ส่งมา
 
    // Extract all possible fields
    const { 
      companyName, 
      address, 
      phoneNumber, 
      email, 
      taxId, 
      contactPerson, 
      logo, 
      signature, 
      isDefault 
    } = body;
    
    // Prepare update data with only the fields that were provided
    const updateData: Record<string, any> = {};
    
    if (companyName !== undefined) updateData.companyName = companyName;
    if (address !== undefined) updateData.address = address;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber || "";
    if (email !== undefined) updateData.email = email || "";
    if (taxId !== undefined) updateData.taxId = taxId || "";
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (logo !== undefined) updateData.logo = logo;
    if (signature !== undefined) updateData.signature = signature;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    
    // ถ้าตั้งเป็นค่าเริ่มต้น ให้ยกเลิกค่าเริ่มต้นของรายการอื่น
    if (isDefault) {
      await prisma.companyProfile.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }
    
    try {
      // Update only the fields that were provided
      const profile = await prisma.companyProfile.update({
        where: { id },
        data: updateData,
      });
      
      return NextResponse.json(profile);
    } catch (prismaError: any) {
      console.error('Prisma error:', prismaError);
      
      // ตรวจสอบว่ามีข้อมูลที่จะอัปเดตหรือไม่
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลบริษัทที่ต้องการอัปเดต' },
          { status: 404 }
        );
      }
      
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error updating company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลบริษัท: ' + (error.message || '') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: Params
) {
  try {
    const id = context.params.id;
    
    // ตรวจสอบว่าเป็นค่าเริ่มต้นหรือไม่
    const profile = await prisma.companyProfile.findUnique({
      where: { id }
    });
    
    if (!profile) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลบริษัท' },
        { status: 404 }
      );
    }
    
    if (profile.isDefault) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบข้อมูลบริษัทที่เป็นค่าเริ่มต้นได้' },
        { status: 400 }
      );
    }
    
    try {
      await prisma.companyProfile.delete({
        where: { id },
      });
      
      return new NextResponse(null, { status: 204 });
    } catch (prismaError: any) {
      console.error('Prisma error:', prismaError);
      
      // ตรวจสอบถ้ามีข้อมูลที่เกี่ยวข้อง
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'ไม่สามารถลบข้อมูลบริษัทที่มีการใช้งานอยู่ได้' },
          { status: 400 }
        );
      }
      
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error deleting company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูลบริษัท: ' + (error.message || '') },
      { status: 500 }
    );
  }
}