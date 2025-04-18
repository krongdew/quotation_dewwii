//quotation-system/src/app/api/financial-documents/generate-document-number/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentType } = body;
    
    if (!documentType) {
      return NextResponse.json(
        { error: 'กรุณาระบุประเภทเอกสาร' },
        { status: 400 }
      );
    }
    
    // กำหนดคำนำหน้าตามประเภทเอกสาร
    let prefix = '';
    switch (documentType) {
      case 'INVOICE':
        prefix = 'INV';
        break;
      case 'RECEIPT':
        prefix = 'REC';
        break;
      case 'TAX_INVOICE':
        prefix = 'TAX';
        break;
      default:
        prefix = 'DOC';
    }
    
    // สร้างส่วนของวันที่ในเลขเอกสาร
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // ค้นหาเลขเอกสารล่าสุดของประเภทเอกสารและเดือนปีนี้
    const pattern = `${prefix}${yearMonth}-%`;
    
    // ใช้ Prisma Raw Query เพื่อหาเลขเอกสารล่าสุดที่ตรงกับรูปแบบ
    const results = await prisma.$queryRaw<{ documentNumber: string }[]>`
      SELECT "documentNumber" 
      FROM "FinancialDocument" 
      WHERE "documentNumber" LIKE ${pattern} 
      ORDER BY "documentNumber" DESC 
      LIMIT 1
    `;
    
    let newSeq = 1; // ค่าเริ่มต้นคือ 001
    
    if (results.length > 0) {
      // หากพบเลขเอกสารล่าสุด ให้แยกเลขลำดับและเพิ่มขึ้น 1
      const latestDocNumber = results[0].documentNumber;
      const seqStr = latestDocNumber.split('-')[1];
      newSeq = parseInt(seqStr) + 1;
    }
    
    // สร้างเลขเอกสารใหม่โดยใช้รูปแบบ PREFIX + YYMM + - + SEQUENCE
    const newDocNumber = `${prefix}${yearMonth}-${String(newSeq).padStart(3, '0')}`;
    
    return NextResponse.json({ documentNumber: newDocNumber });
  } catch (error) {
    console.error('Error generating document number:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างเลขเอกสาร: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}