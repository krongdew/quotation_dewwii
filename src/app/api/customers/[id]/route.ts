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
    const { companyName, address, phoneNumber, email, taxId, contactPerson } = body;
    
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        companyName,
        address,
        phoneNumber,
        email,
        taxId,
        contactPerson,
      },
    });
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลลูกค้า' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    await prisma.customer.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูลลูกค้า' },
      { status: 500 }
    );
  }
}