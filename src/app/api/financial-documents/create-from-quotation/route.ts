// quotation-system/src/app/api/financial-documents/create-from-quotation/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// POST - สร้างเอกสารทางการเงินจากใบเสนอราคา
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Creating financial document from quotation:', body);
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.quotationId) {
      return NextResponse.json(
        { error: 'กรุณาระบุใบเสนอราคา' },
        { status: 400 }
      );
    }
    
    if (!body.documentType) {
      return NextResponse.json(
        { error: 'กรุณาเลือกประเภทเอกสาร' },
        { status: 400 }
      );
    }
    
    if (!body.documentNumber) {
      return NextResponse.json(
        { error: 'กรุณาระบุเลขที่เอกสาร' },
        { status: 400 }
      );
    }
    
    // ดึงข้อมูลใบเสนอราคา
    const quotation = await prisma.quotation.findUnique({
      where: { id: body.quotationId },
      include: {
        items: true,
      },
    });
    
    if (!quotation) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลใบเสนอราคา' },
        { status: 404 }
      );
    }
    
    // สร้างเอกสารทางการเงินจากข้อมูลใบเสนอราคา
    const document = await prisma.financialDocument.create({
      data: {
        documentNumber: body.documentNumber,
        documentType: body.documentType,
        issueDate: new Date(body.issueDate || new Date()),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        quotationId: body.quotationId,
        customerId: quotation.customerId,
        companyId: quotation.companyId,
        includeVat: quotation.includeVat,
        subtotal: quotation.subtotal,
        discount: quotation.discount,
        afterDiscount: quotation.afterDiscount,
        vat: quotation.vat,
        totalAmount: quotation.totalAmount,
        withholding: quotation.withholding,
        netTotal: quotation.netTotal,
        isPaid: body.isPaid || false,
        paymentMethod: body.paymentMethod,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        paymentReference: body.paymentReference,
        customerSignature: quotation.customerSignature,
        sellerSignature: quotation.sellerSignature,
        // คัดลอกรายการสินค้าจากใบเสนอราคา
        items: {
          create: quotation.items.map((item: any) => ({
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
    console.error('Error creating financial document from quotation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการสร้างเอกสารทางการเงิน: ${errorMessage}` },
      { status: 500 }
    );
  }
}