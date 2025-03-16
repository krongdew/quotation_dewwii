//quotation-system/src/app/api/financial-documents/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - ดึงเอกสารทางการเงินตาม ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    console.log('GET financial document with params:', params);
    const id = params.id;
    console.log('Fetching financial document with ID:', id);

    // หมายเหตุ: ให้ใช้ชื่อโมเดลตามที่กำหนดใน schema.prisma
    const document = await prisma.financialDocument.findUnique({
      where: { id },
      include: {
        customer: true,
        company: true,
        quotation: true,
        items: true,
      },
    });
    
    if (!document) {
      console.log('Financial document not found for ID:', id);
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลเอกสารทางการเงิน' },
        { status: 404 }
      );
    }
    
    console.log('Found financial document:', document.id);
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching financial document:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเอกสารทางการเงิน: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// PUT - อัปเดตเอกสารทางการเงินตาม ID
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Update financial document and items in a transaction
    const updatedDocument = await prisma.$transaction(async (tx: any) => {
      // Update the document first
      const document = await tx.financialDocument.update({
        where: { id },
        data: {
          documentNumber: body.documentNumber,
          documentType: body.documentType,
          issueDate: new Date(body.issueDate),
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
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
        },
      });
      
      // Delete all existing items
      await tx.financialDocumentItem.deleteMany({
        where: { documentId: id },
      });
      
      // Create new items
      for (const item of body.items) {
        await tx.financialDocumentItem.create({
          data: {
            documentId: id,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            amount: item.amount,
          },
        });
      }
      
      // Return the updated document with related data
      return tx.financialDocument.findUnique({
        where: { id },
        include: {
          customer: true,
          company: true,
          quotation: true,
          items: true,
        },
      });
    });
    
    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating financial document:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทเอกสารทางการเงิน' },
      { status: 500 }
    );
  }
}

// DELETE - ลบเอกสารทางการเงินตาม ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = params.id;
    console.log('Attempting to delete financial document with ID:', id);
    
    // ตรวจสอบว่ามีเอกสารนี้หรือไม่
    const document = await prisma.financialDocument.findUnique({
      where: { id }
    });
    
    if (!document) {
      console.log('Financial document not found:', id);
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลเอกสารทางการเงิน' },
        { status: 404 }
      );
    }
    
    try {
      // ลบข้อมูลเอกสารและรายการสินค้าที่เกี่ยวข้อง
      await prisma.$transaction(async (tx: any) => {
        // ลบรายการสินค้าก่อน (เนื่องจากมี foreign key constraint)
        await tx.financialDocumentItem.deleteMany({
          where: { documentId: id },
        });
        
        // ลบเอกสาร
        await tx.financialDocument.delete({
          where: { id },
        });
      });
      
      console.log('Financial document deleted successfully:', id);
      return new NextResponse(null, { status: 204 });
    } catch (prismaError: any) {
      console.error('Prisma error during delete:', prismaError);
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูลเอกสารทางการเงิน: ' + (error.message || '') },
      { status: 500 }
    );
  }
}