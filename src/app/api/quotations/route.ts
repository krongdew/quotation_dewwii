//quotation-system/src/app/api/quotations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log("Fetching all quotations...");
    
    // ใช้ try/catch เพื่อตรวจสอบว่ามี company relation หรือไม่
    let includeCompany = false;
    try {
      // ลองทำ query เพื่อดูว่า company field มีอยู่จริงหรือไม่
      await prisma.quotation.findFirst({
        select: {
          id: true,
          company: {
            select: {
              id: true
            }
          }
        },
        take: 1
      });
      includeCompany = true;
    } catch (e) {
      console.warn("Company relation doesn't exist:", e);
      includeCompany = false;
    }
    
    // ดึงข้อมูล quotations พร้อม relations ที่มี
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: true,
        ...(includeCompany ? { company: true } : {}),
        items: true,
      },
    });
    
    console.log(`Found ${quotations.length} quotations`);
    return NextResponse.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเสนอราคา: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received data for quotation creation:', body);
    
    // ตรวจสอบว่ามีข้อมูลจำเป็นครบถ้วนหรือไม่
    if (!body.customerId) {
      return NextResponse.json(
        { error: 'กรุณาเลือกลูกค้า' },
        { status: 400 }
      );
    }
    
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ' },
        { status: 400 }
      );
    }
    
    // ดำเนินการสร้างใบเสนอราคา
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: body.quotationNumber,
        issueDate: new Date(body.issueDate),
        customerId: body.customerId,
        companyId: body.companyId,
        includeVat: body.includeVat || false,
        subtotal: body.subtotal,
        discount: body.discount || 0,
        afterDiscount: body.afterDiscount,
        vat: body.vat,
        totalAmount: body.totalAmount,
        withholding: body.withholding || 0,
        netTotal: body.netTotal,
        customerSignature: body.customerSignature,
        sellerSignature: body.sellerSignature,
        // นำเข้ารายการสินค้าด้วย
        items: {
          create: body.items.map((item: any) => ({
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            amount: item.amount,
          }))
        }
      },
      include: {
        customer: true,
        company: true,
        items: true,
      }
    });
    
    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error('Error creating quotation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการสร้างใบเสนอราคา: ${errorMessage}` },
      { status: 500 }
    );
  }
}