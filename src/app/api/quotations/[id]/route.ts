import { NextResponse, NextRequest } from 'next/server';
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
    const id = params.id;
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
    const id = params.id;
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
          company: true,  // เพิ่มการดึงข้อมูลผู้เสนอราคา
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = params.id;
    console.log('Attempting to delete quotation with ID:', id);
    
    // ตรวจสอบว่ามีใบเสนอราคานี้หรือไม่
    const quotation = await prisma.quotation.findUnique({
      where: { id }
    });
    
    if (!quotation) {
      console.log('Quotation not found:', id);
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลใบเสนอราคา' },
        { status: 404 }
      );
    }
    
    try {
      // ลบข้อมูลใบเสนอราคาและรายการสินค้าที่เกี่ยวข้อง
      await prisma.$transaction(async (tx: any) => {
        // ลบรายการสินค้าก่อน (เนื่องจากมี foreign key constraint)
        await tx.quotationItem.deleteMany({
          where: { quotationId: id },
        });
        
        // ลบใบเสนอราคา
        await tx.quotation.delete({
          where: { id },
        });
      });
      
      console.log('Quotation deleted successfully:', id);
      return new NextResponse(null, { status: 204 });
    } catch (prismaError: any) {
      console.error('Prisma error during delete:', prismaError);
      
      // ตรวจสอบถ้ามีข้อมูลที่เกี่ยวข้อง
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'ไม่สามารถลบข้อมูลใบเสนอราคาที่มีการใช้งานอยู่ได้' },
          { status: 400 }
        );
      }
      
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูลใบเสนอราคา: ' + (error.message || '') },
      { status: 500 }
    );
  }
}