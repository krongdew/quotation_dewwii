//quotation-system/src/app/api/quotations/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}


export async function GET(request: Request, { params }: RouteParams) {
  try {
    console.log('GET quotation with params:', params);
    // ดึงค่า id โดยตรง ไม่ต้อง await
    const id = (await params).id;
    console.log('Fetching quotation with ID:', id);

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        company: true,
        items: true,
      },
    });
    
    if (!quotation) {
      console.log('Quotation not found for ID:', id);
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลใบเสนอราคา' },
        { status: 404 }
      );
    }
    
    console.log('Found quotation:', quotation.id);
    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเสนอราคา: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const { 
      quotationNumber, 
      issueDate, 
      customerId,
      companyId,       // เพิ่มฟิลด์ companyId
      includeVat,      // เพิ่มฟิลด์ includeVat
      items, 
      subtotal,
      discount,
      afterDiscount,
      vat,
      totalAmount,
      withholding,
      netTotal,
      customerSignature,
      sellerSignature
    } = body;
    
    // Update quotation and items in a transaction
    const updatedQuotation = await prisma.$transaction(async (tx: any) => {
      // Update the quotation first
      const quotation = await tx.quotation.update({
        where: { id },
        data: {
          quotationNumber,
          issueDate: new Date(issueDate),
          customerId,
          companyId,       // เพิ่มฟิลด์ companyId
          includeVat: includeVat || false,  // เพิ่มฟิลด์ includeVat พร้อมค่าเริ่มต้น
          subtotal,
          discount,
          afterDiscount,
          vat,
          totalAmount,
          withholding,
          netTotal,
          customerSignature,
          sellerSignature,
        },
      });
      
      // Delete all existing items
      await tx.quotationItem.deleteMany({
        where: { quotationId: id },
      });
      
      // Create new items
      for (const item of items) {
        await tx.quotationItem.create({
          data: {
            quotationId: id,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            amount: item.amount,
          },
        });
      }
      
      // Return the updated quotation with related data
      return tx.quotation.findUnique({
        where: { id },
        include: {
          customer: true,
          company: true,  // เพิ่มการดึงข้อมูลบริษัทผู้เสนอราคา
          items: true,
        },
      });
    });
    
    return NextResponse.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทใบเสนอราคา' },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // ใช้วิธีเดียวกับใน GET และ PUT
    const id = (await params).id;
    console.log('API: Deleting quotation with ID:', id);
    
    // ตรวจสอบว่ามีใบเสนอราคานี้อยู่จริงหรือไม่
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!quotation) {
      return NextResponse.json(
        { error: 'ไม่พบใบเสนอราคานี้' },
        { status: 404 }
      );
    }
    
    // ลบใบเสนอราคาและรายการสินค้าที่เกี่ยวข้องโดยใช้ transaction
    const result = await prisma.$transaction(async (tx) => {
      // ลบรายการสินค้าก่อน
      await tx.quotationItem.deleteMany({
        where: { quotationId: id }
      });
      
      // จากนั้นลบใบเสนอราคา
      return tx.quotation.delete({
        where: { id }
      });
    });
    
    console.log('API: Successfully deleted quotation:', result);
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error('API Error deleting quotation:', error);
    return NextResponse.json(
      { error: `Failed to delete quotation: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}