//quotation-system/src/app/(dashboard)/quotations/pdf/[id]/page.tsx
'use client';
// @ts-ignore
// eslint-disable-next-line
import React, { useState, useEffect, useRef } from 'react';
import { Typography, Spin, message, Button, Card, Divider, Row, Col, Table } from 'antd';
import { PrinterOutlined, DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
// นำเข้า types จากโครงสร้างใหม่
import { Quotation, QuotationItem, CompanyProfile } from '../../../../components/quotation/types';

const { Title, Text } = Typography;

const PDFQuotationPage: React.FC = () => {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await fetch(`/api/quotations/${id}`);
        if (!res.ok) throw new Error('Failed to fetch quotation');
        const data = await res.json();
        console.log('Quotation data:', data);
        setQuotation(data);
        
        // Fetch company profile if companyId is available
        if (data.companyId) {
          console.log('Fetching company with ID:', data.companyId);
          const companyRes = await fetch(`/api/company-profile/${data.companyId}`);
          if (companyRes.ok) {
            const companyData = await companyRes.json();
            console.log('Company data:', companyData);
            setCompany(companyData);
          } else {
            console.error('Error fetching company profile:', await companyRes.text());
          }
        } else {
          console.warn('No companyId found in quotation data');
        }
      } catch (error) {
        console.error('Error fetching quotation:', error);
        message.error('ไม่สามารถโหลดข้อมูลใบเสนอราคาได้');
      } finally {
        setLoading(false);
      }
    };
  
    fetchQuotation();
  }, [id]);

  
  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: '5%',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      key: 'description',
      width: '45%',
    },
    {
      title: 'หน่วย',
      dataIndex: 'unit',
      key: 'unit',
      width: '8%',
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '12%',
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      width: '15%',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      width: '15%',
      render: (value: number) => value.toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>ไม่พบข้อมูลใบเสนอราคา</Title>
        <Button onClick={() => router.push('/quotations')}>กลับไปหน้ารายการ</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    window.print();
  };

  return (
    <>
      <div className="no-print" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/quotations')}>
          กลับไปหน้ารายการ
        </Button>
        <div>
          <Button icon={<PrinterOutlined />} onClick={handlePrint} style={{ marginRight: 8 }}>
            พิมพ์
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={generatePDF}>
            ดาวน์โหลด PDF
          </Button>
        </div>
      </div>

      <div ref={pdfRef} className="pdf-container" style={{ padding: 15, maxWidth: '210mm', margin: '0 auto', backgroundColor: 'white' }}>
        <Card variant="borderless">
          <div style={{ textAlign: 'center', marginBottom: 15 }}>
            <Title level={3} style={{ marginBottom: 0 }}>ใบเสนอราคา / Quotation</Title>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              {company ? (
                <div style={{ marginBottom: 15, border: '1px solid #f0f0f0', padding: '8px', borderRadius: '4px', fontSize: '0.9em' }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '3px', fontSize: '0.85em' }}>บริษัทผู้เสนอราคา:</Text>
                  <Title level={5} style={{ margin: '0 0 5px 0' }}>{company.companyName}</Title>
                  <Text style={{ fontSize: '0.85em' }}>ที่อยู่: {company.address}</Text><br />
                  <Text style={{ fontSize: '0.85em' }}>เลขประจำตัวผู้เสียภาษี: {company.taxId}</Text><br />
                  <Text style={{ fontSize: '0.85em' }}>ติดต่อ: {company.contactPerson}</Text><br />
                  <Text style={{ fontSize: '0.85em' }}>โทร: {company.phoneNumber}</Text><br />
                  <Text style={{ fontSize: '0.85em' }}>อีเมล: {company.email}</Text>
                </div>
              ) : (
                <div style={{ marginBottom: 15, border: '1px dashed #ff4d4f', padding: '8px', borderRadius: '4px' }}>
                  <Text type="danger">ไม่พบข้อมูลบริษัทผู้เสนอราคา</Text>
                </div>
              )}
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: 15, fontSize: '0.9em' }}>
                <Text strong>เลขที่ใบเสนอราคา:</Text> {quotation.quotationNumber}<br />
                <Text strong>วันที่:</Text> {dayjs(quotation.issueDate).format('DD/MM/YYYY')}<br />
              </div>
            </Col>
          </Row>
          <Divider style={{ margin: '12px 0' }} />
          
          <Row gutter={24}>
        <Col span={24}>
          <div style={{ marginBottom: 15, fontSize: '0.9em' }}>
            <Text strong>ลูกค้า:</Text> {quotation?.customer?.companyName || '-'}<br />
            <Text strong>ที่อยู่:</Text> {quotation?.customer?.address || '-'}<br />
            <Text strong>เลขประจำตัวผู้เสียภาษี:</Text> {quotation?.customer?.taxId || '-'}<br />
            <Text strong>ผู้ติดต่อ:</Text> {quotation?.customer?.contactPerson || '-'}<br />
            <Text strong>เบอร์โทร:</Text> {quotation?.customer?.phoneNumber || '-'}<br />
            <Text strong>อีเมล:</Text> {quotation?.customer?.email || '-'}
          </div>
        </Col>
      </Row>

          <Table
            dataSource={quotation.items}
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
                    <Text strong>{quotation.subtotal.toLocaleString()} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                
                {quotation.discount > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong>ส่วนลด / Discount:</Text>
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{quotation.discount.toLocaleString()} บาท</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong>ยอดรวมหลังหักส่วนลด / After Discount:</Text>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{quotation.afterDiscount.toLocaleString()} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                
                {quotation.includeVat && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong>ภาษีมูลค่าเพิ่ม 7% / VAT 7%:</Text>
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{quotation.vat.toLocaleString()} บาท</Text>
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
                    <Text strong>{quotation.totalAmount.toLocaleString()} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                
                {quotation.withholding > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong>หัก ณ ที่จ่าย 3% / Withholding Tax 3%:</Text>
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{quotation.withholding.toLocaleString()} บาท</Text>
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
                    <Text strong style={{ fontSize: 18 }}>{quotation.netTotal.toLocaleString()} บาท</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <Divider style={{ margin: '10px 0' }} />

          <Row gutter={24} style={{ marginTop: 20 }}>
            <Col span={12} style={{ textAlign: 'center' }}>
              <div>
                <div style={{ marginBottom: 10 }}>
                  <Text strong>ผู้เสนอราคา / Proposer</Text>
                </div>
                {quotation.sellerSignature && (
                  <div style={{ marginBottom: 5, height: 60 }}>
                    <img 
                      src={quotation.sellerSignature} 
                      alt="Seller Signature" 
                      style={{ maxHeight: 60, maxWidth: 120 }} 
                    />
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
      <Text strong>ผู้อนุมัติ / Approved By</Text>
    </div>
    {quotation.customerSignature ? (
      <div style={{ marginBottom: 5, height: 60 }}>
        <img 
          src={quotation.customerSignature} 
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
          </Row>
       
          <div style={{ marginTop: 40, textAlign: 'center', fontSize: '0.85em' }}>
            <Text type="secondary">ใบเสนอราคานี้มีอายุ 30 วัน นับจากวันที่ออกใบเสนอราคา</Text>
            <br />
            <Text type="secondary">This quotation is valid for 30 days from the issue date</Text>
          </div>
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

export default PDFQuotationPage;