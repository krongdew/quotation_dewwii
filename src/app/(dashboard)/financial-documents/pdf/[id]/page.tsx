//quotation-system/src/app/(dashboard)/financial-documents/pdf/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Spin, 
  Result, 
  Button, 
  Card, 
  Table, 
  Divider, 
  Row, 
  Col,
  Space,
  Descriptions
} from 'antd';
import { useRouter } from 'next/navigation';
import { 
  FilePdfOutlined, 
  PrinterOutlined, 
  ArrowLeftOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const { Title, Text } = Typography;

interface PDFViewProps {
  params: {
    id: string;
  };
}

const FinancialDocPDFPage: React.FC<PDFViewProps> = ({ params }) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = params;
  const printRef = useRef(null);

  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/financial-documents/${id}`);
        if (!res.ok) {
          throw new Error('ไม่สามารถโหลดข้อมูลเอกสาร');
        }
        const data = await res.json();
        setDocument(data);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [id]);

  // ฟังก์ชันสำหรับพิมพ์หรือบันทึก PDF
  const handlePrint = () => {
    window.print();
  };

  // ฟังก์ชันแสดงชื่อประเภทเอกสาร
  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return 'ใบวางบิล / INVOICE';
      case 'RECEIPT':
        return 'ใบเสร็จรับเงิน / RECEIPT';
      case 'TAX_INVOICE':
        return 'ใบกำกับภาษี / TAX INVOICE';
      default:
        return 'เอกสารทางการเงิน';
    }
  };

  // ฟังก์ชันแสดงวิธีการชำระเงิน
  const getPaymentMethodName = (method: string | undefined) => {
    if (!method) return '-';
    
    switch (method) {
      case 'CASH':
        return 'เงินสด';
      case 'TRANSFER':
        return 'โอนเงิน';
      case 'CHECK':
        return 'เช็ค';
      case 'CREDIT_CARD':
        return 'บัตรเครดิต';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <Result
        status="error"
        title="เกิดข้อผิดพลาด"
        subTitle={error || 'ไม่พบข้อมูลเอกสาร'}
        extra={[
          <Button 
            type="primary" 
            key="back" 
            onClick={() => router.push('/financial-documents')}
          >
            กลับไปหน้ารายการ
          </Button>,
        ]}
      />
    );
  }

  // คอลัมน์ข้อมูลรายการสินค้า
  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: 'รายการ',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'หน่วย',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right' as const,
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      width: 150,
      align: 'right' as const,
      render: (price: number) => price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right' as const,
      render: (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
  ];

  return (
    <>
      <div className="no-print" style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/financial-documents')}>
            กลับ
          </Button>
          <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint}>
            พิมพ์
          </Button>
          <Button icon={<FilePdfOutlined />} type="primary" ghost onClick={handlePrint}>
            บันทึก PDF
          </Button>
        </Space>
      </div>
      
      <div ref={printRef} className="pdf-container" style={{ padding: 20, backgroundColor: 'white', maxWidth: '210mm', margin: '0 auto' }}>
        <Card variant="borderless">
          <div style={{ textAlign: 'center', marginBottom: 15 }}>
            <Title level={3} style={{ marginBottom: 0 }}>
              {document.documentType === 'INVOICE' && 'ใบวางบิล / INVOICE'}
              {document.documentType === 'RECEIPT' && 'ใบเสร็จรับเงิน / RECEIPT'}
              {document.documentType === 'TAX_INVOICE' && 'ใบกำกับภาษี / TAX INVOICE'}
            </Title>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              {document.company ? (
                <div style={{ marginBottom: 15, border: '1px solid #f0f0f0', padding: '8px', borderRadius: '4px', fontSize: '0.9em' }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '3px', fontSize: '0.85em' }}>ผู้ออกเอกสาร:</Text>
                  <Title level={5} style={{ margin: '0 0 5px 0' }}>{document.company.companyName}</Title>
                  <Text style={{ fontSize: '0.85em' }}>ที่อยู่: {document.company.address}</Text><br />
                  {document.company.taxId && <><Text style={{ fontSize: '0.85em' }}>เลขประจำตัวผู้เสียภาษี: {document.company.taxId}</Text><br /></>}
                  {document.company.contactPerson && <><Text style={{ fontSize: '0.85em' }}>ติดต่อ: {document.company.contactPerson}</Text><br /></>}
                  {document.company.phoneNumber && <><Text style={{ fontSize: '0.85em' }}>โทร: {document.company.phoneNumber}</Text><br /></>}
                  {document.company.email && <><Text style={{ fontSize: '0.85em' }}>อีเมล: {document.company.email}</Text></>}
                </div>
              ) : (
                <div style={{ marginBottom: 15, border: '1px dashed #ff4d4f', padding: '8px', borderRadius: '4px' }}>
                  <Text type="danger">ไม่พบข้อมูลผู้ออกเอกสาร</Text>
                </div>
              )}
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: 15, fontSize: '0.9em' }}>
                <Text strong>เลขที่: </Text> {document.documentNumber}<br />
                <Text strong>วันที่: </Text> {dayjs(document.issueDate).format('DD/MM/YYYY')}<br />
                {document.documentType === 'INVOICE' && document.dueDate && (
                  <><Text strong>วันครบกำหนด: </Text> {dayjs(document.dueDate).format('DD/MM/YYYY')}<br /></>
                )}
                {document.quotation && (
                  <><Text strong>อ้างอิงใบเสนอราคา: </Text> {document.quotation.quotationNumber}<br /></>
                )}
                {document.documentType === 'RECEIPT' && document.paymentDate && (
                  <><Text strong>วันที่ชำระเงิน: </Text> {dayjs(document.paymentDate).format('DD/MM/YYYY')}<br /></>
                )}
                {document.documentType === 'RECEIPT' && document.paymentMethod && (
                  <><Text strong>วิธีการชำระเงิน: </Text> {getPaymentMethodName(document.paymentMethod)}<br /></>
                )}
                {document.documentType === 'RECEIPT' && document.paymentReference && (
                  <><Text strong>อ้างอิงการชำระเงิน: </Text> {document.paymentReference}<br /></>
                )}
              </div>
            </Col>
          </Row>
          <Divider style={{ margin: '12px 0' }} />
          
          <Row gutter={24}>
            <Col span={24}>
              <div style={{ marginBottom: 15, fontSize: '0.9em' }}>
                <Text strong>ลูกค้า:</Text> {document.customer?.companyName || '-'}<br />
                <Text strong>ที่อยู่:</Text> {document.customer?.address || '-'}<br />
                {document.customer?.taxId && <><Text strong>เลขประจำตัวผู้เสียภาษี:</Text> {document.customer.taxId}<br /></>}
                {document.customer?.contactPerson && <><Text strong>ผู้ติดต่อ:</Text> {document.customer.contactPerson}<br /></>}
                {document.customer?.phoneNumber && <><Text strong>เบอร์โทร:</Text> {document.customer.phoneNumber}<br /></>}
                {document.customer?.email && <><Text strong>อีเมล:</Text> {document.customer.email}</>}
              </div>
            </Col>
          </Row>

          <Table
            dataSource={document.items}
            columns={columns}
            pagination={false}
            rowKey="id"
            bordered
            size="small"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong>ยอดรวม / Subtotal:</Text>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{document.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                
                {document.discount > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong>ส่วนลด / Discount:</Text>
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{document.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                {document.afterDiscount !== document.subtotal && (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong>ยอดรวมหลังหักส่วนลด / After Discount:</Text>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{document.afterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                )}
                
                {document.includeVat && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong>ภาษีมูลค่าเพิ่ม 7% / VAT 7%:</Text>
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{document.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong>ยอดรวมทั้งสิ้น / Total Amount:</Text>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{document.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                
                {document.withholding > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong>หัก ณ ที่จ่าย 3% / Withholding Tax 3%:</Text>
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{document.withholding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong>ยอดสุทธิ / Net Total:</Text>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ fontSize: 18 }}>{document.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <Divider style={{ margin: '10px 0' }} />

          {/* หมายเหตุเฉพาะประเภทเอกสาร */}
          <div style={{ margin: '20px 0' }}>
            {document.documentType === 'RECEIPT' && (
              <div style={{ textAlign: 'center' }}>
                <Text strong>ได้รับเงินถูกต้องแล้ว</Text>
              </div>
            )}
            {document.documentType === 'TAX_INVOICE' && (
              <div style={{ textAlign: 'center' }}>
                <Text strong>ใบกำกับภาษีฉบับนี้เป็นใบกำกับภาษีแบบเต็มรูปแบบตามมาตรา 86/4 แห่งประมวลรัษฎากร</Text>
              </div>
            )}
          </div>

          <Row gutter={24} style={{ marginTop: 20 }}>
            <Col span={12} style={{ textAlign: 'center' }}>
              <div>
                <div style={{ marginBottom: 10 }}>
                  <Text strong>ผู้รับ / Customer</Text>
                </div>
                {document.customerSignature ? (
                  <div style={{ marginBottom: 5, height: 60 }}>
                    <img 
                      src={document.customerSignature} 
                      alt="Customer Signature" 
                      style={{ maxHeight: 60, maxWidth: 120 }} 
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: 5, height: 60 }}>
                    {/* พื้นที่ว่างสำหรับลายเซ็น */}
                  </div>
                )}
                <div style={{ border: '0.5px solid #d9d9d9', width: 150, margin: '5px auto' }} />
                <div style={{ fontSize: '0.85em' }}>
                  <Text>(..............................................)</Text>
                </div>
                <div style={{ fontSize: '0.85em' }}>
                  <Text>วันที่ / Date ....../....../......</Text>
                </div>
              </div>
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
              <div>
                <div style={{ marginBottom: 10 }}>
                  <Text strong>ผู้ออกเอกสาร / Issuer</Text>
                </div>
                {document.sellerSignature ? (
                  <div style={{ marginBottom: 5, height: 60 }}>
                    <img 
                      src={document.sellerSignature} 
                      alt="Seller Signature" 
                      style={{ maxHeight: 60, maxWidth: 120 }} 
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: 5, height: 60 }}>
                    {/* พื้นที่ว่างสำหรับลายเซ็น */}
                  </div>
                )}
                <div style={{ border: '0.5px solid #d9d9d9', width: 150, margin: '5px auto' }} />
                <div style={{ fontSize: '0.85em' }}>
                  <Text>(..............................................)</Text>
                </div>
                <div style={{ fontSize: '0.85em' }}>
                  <Text>วันที่ / Date ....../....../......</Text>
                </div>
              </div>
            </Col>
          </Row>
          
          {document.documentType === 'INVOICE' && (
            <div style={{ marginTop: 40, textAlign: 'center', fontSize: '0.85em' }}>
              <Text type="secondary">กรุณาชำระเงินภายในกำหนด หากมีข้อสงสัยกรุณาติดต่อกลับภายใน 7 วัน</Text>
              <br />
              <Text type="secondary">Please make payment by due date. For any inquiries, please contact within 7 days.</Text>
            </div>
          )}

          {document.documentType === 'RECEIPT' && (
            <div style={{ marginTop: 40, textAlign: 'center', fontSize: '0.85em' }}>
              <Text type="secondary">ขอบคุณที่ใช้บริการ</Text>
              <br />
              <Text type="secondary">Thank you for your business.</Text>
            </div>
          )}
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { 
            display: none !important; 
          }
          body { 
            margin: 0; 
            padding: 0;
            font-size: 12px;
          }
          .pdf-container { 
            padding: 0 !important; 
          }
          .ant-card { 
            box-shadow: none !important; 
            border: none !important;
          }
          .ant-card-body {
            padding: 8mm !important;
          }
          /* ซ่อนเมนูเว็บไซต์ทั้งหมดเมื่อพิมพ์ */
          header, nav, .ant-layout-sider, footer, #__next > *:not(.pdf-container) {
            display: none !important;
          }
          /* ให้แสดงเฉพาะส่วน pdf-container เท่านั้น */
          .pdf-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
          /* จัดการหน้ากระดาษ */
          @page {
            size: A4 portrait;
            margin: 0;
          }
          /* ปรับขนาดตาราง */
          .ant-table {
            font-size: 11px !important;
          }
          .ant-table-small .ant-table-thead > tr > th {
            padding: 4px 8px !important;
          }
          .ant-table-small .ant-table-tbody > tr > td {
            padding: 4px 8px !important;
          }
          /* ป้องกันการตัดข้อความ */
          .ant-typography {
            margin-bottom: 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default FinancialDocPDFPage;