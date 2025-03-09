import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RequestContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RequestContext
) {
  try {
    const { id } = context.params;
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
  context: RequestContext
) {
  try {
    const { id } = context.params;
    const body = await request.json();
 
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
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (email !== undefined) updateData.email = email;
    if (taxId !== undefined) updateData.taxId = taxId;
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
    
    // Update only the fields that were provided
    const profile = await prisma.companyProfile.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลบริษัท' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RequestContext
) {
  try {
    const { id } = context.params;
    
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
    
    await prisma.companyProfile.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting company profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูลบริษัท' },
      { status: 500 }
    );
  }
}