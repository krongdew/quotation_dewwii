// quotation-system/src/app/api/financial-documents/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET - ดึงรายการเอกสารทางการเงินทั้งหมด
export async function GET() {
  try {
    console.log("Fetching all financial documents...");
    
    const documents = await prisma.financialDocument.findMany({
      include: {
        customer: true,
        company: true,
        quotation: {
          select: {
            quotationNumber: true
          }
        },
        items: true,
      },
    });
    
    console.log(`Found ${documents.length} financial documents`);
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching financial documents:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเอกสารทางการเงิน: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// POST - สร้างเอกสารทางการเงินใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received data for financial document creation:', body);
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.customerId) {
      return NextResponse.json(
        { error: 'กรุณาเลือกลูกค้า' },
        { status: 400 }
      );
    }
    
    if (!body.documentType) {
      return NextResponse.json(
        { error: 'กรุณาเลือกประเภทเอกสาร' },
        { status: 400 }
      );
    }
    
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ' },
        { status: 400 }
      );
    }
    
    // ดำเนินการสร้างเอกสารทางการเงิน
    const document = await prisma.financialDocument.create({
      data: {
        documentNumber: body.documentNumber,
        documentType: body.documentType,
        issueDate: new Date(body.issueDate),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        quotationId: body.quotationId,
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
        isPaid: body.isPaid || false,
        paymentMethod: body.paymentMethod,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        paymentReference: body.paymentReference,
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
        quotation: true,
        items: true,
      }
    });
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating financial document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการสร้างเอกสารทางการเงิน: ${errorMessage}` },
      { status: 500 }
    );
  }
}