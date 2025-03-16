//quotation-system/src/app/(dashboard)/financial-documents/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Card, 
  message,
  Tooltip
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  FilePdfOutlined, 
  EyeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title } = Typography;

// กำหนด types
interface Customer {
  id: string;
  companyName: string;
}

interface Company {
  id: string;
  companyName: string;
}

interface DocumentItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  amount: number;
}

interface FinancialDocument {
  id: string;
  documentNumber: string;
  documentType: 'INVOICE' | 'RECEIPT' | 'TAX_INVOICE';
  issueDate: string;
  dueDate?: string;
  customer: Customer;
  customerId: string;
  company?: Company;
  companyId?: string;
  quotationId?: string;
  items: DocumentItem[];
  subtotal: number;
  discount: number;
  afterDiscount: number;
  vat: number;
  totalAmount: number;
  withholding: number;
  netTotal: number;
  isPaid: boolean;
  paymentMethod?: 'CASH' | 'TRANSFER' | 'CHECK' | 'CREDIT_CARD';
  paymentDate?: string;
  paymentReference?: string;
  customerSignature?: string;
  sellerSignature?: string;
}

const FinancialDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch documents data
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/financial-documents');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching financial documents:', error);
      message.error('ไม่สามารถโหลดข้อมูลเอกสารทางการเงินได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle document view/edit
  const handleView = (id: string) => {
    router.push(`/financial-documents/view/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/financial-documents/edit/${id}`);
  };

  // Handle document delete
  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      fetch(`/api/financial-documents/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            message.success('ลบข้อมูลสำเร็จ');
            fetchDocuments();
          } else {
            message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
          }
        })
        .catch(err => message.error('เกิดข้อผิดพลาด: ' + err.message));
    }
  };

  // Generate PDF function
  const handleGeneratePDF = (id: string) => {
    router.push(`/financial-documents/pdf/${id}`);
  };

  // Helper function for document type display
  const getDocumentTypeDisplay = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return <Tag color="blue">ใบวางบิล</Tag>;
      case 'RECEIPT':
        return <Tag color="green">ใบเสร็จรับเงิน</Tag>;
      case 'TAX_INVOICE':
        return <Tag color="purple">ใบกำกับภาษี</Tag>;
      default:
        return <Tag>ไม่ระบุ</Tag>;
    }
  };

  // Helper function for payment status display
  const getPaymentStatusDisplay = (document: FinancialDocument) => {
    if (document.documentType === 'RECEIPT') {
      return <Tag color="green">ชำระแล้ว</Tag>;
    }
    
    return document.isPaid 
      ? <Tag color="green">ชำระแล้ว</Tag>
      : <Tag color="red">รอชำระ</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'เลขที่เอกสาร',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
    },
    {
      title: 'ประเภทเอกสาร',
      key: 'documentType',
      render: (_: any, record: FinancialDocument) => getDocumentTypeDisplay(record.documentType),
    },
    {
      title: 'วันที่',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'ลูกค้า',
      dataIndex: ['customer', 'companyName'],
      key: 'customer',
    },
    {
      title: 'มูลค่ารวม',
      dataIndex: 'netTotal',
      key: 'netTotal',
      render: (text: number) => `${text.toLocaleString()} บาท`,
    },
    {
      title: 'สถานะการชำระเงิน',
      key: 'paymentStatus',
      render: (_: any, record: FinancialDocument) => getPaymentStatusDisplay(record),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: FinancialDocument) => (
        <Space size="small">
          <Tooltip title="ดู">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
              type="default"
              size="small"
            />
          </Tooltip>
          <Tooltip title="แก้ไข">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title="PDF">
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => handleGeneratePDF(record.id)}
              type="default"
              size="small"
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              danger
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>เอกสารทางการเงิน</Title>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={documents.map(doc => ({ ...doc, key: doc.id }))}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  );
};

export default FinancialDocumentsPage;