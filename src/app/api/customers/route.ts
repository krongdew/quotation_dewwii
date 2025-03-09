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
    const body = await request.json();
    const { companyName, address, phoneNumber, email, taxId, contactPerson } = body;
    
    const customer = await prisma.customer.create({
      data: {
        companyName,
        address,
        phoneNumber,
        email,
        taxId,
        contactPerson,
      },
    });
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างข้อมูลลูกค้า' },
      { status: 500 }
    );
  }
}