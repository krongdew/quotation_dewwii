//quotation-system/src/app/(dashboard)/quotations/page.tsx
'use client';
// @ts-ignore
// eslint-disable-next-line
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Card, 
  message,
  Modal 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FilePdfOutlined, 
  EyeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Customer {
  id: string;
  companyName: string;
}

interface QuotationItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  amount: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  issueDate: string;
  customer: Customer;
  customerId: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  afterDiscount: number;
  vat: number;
  totalAmount: number;
  withholding: number;
  netTotal: number;
  customerSignature?: string;
  sellerSignature?: string;
}

const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch quotations data
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotations');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQuotations(data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      message.error('ไม่สามารถโหลดข้อมูลใบเสนอราคาได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Handle quotation creation/edit
  const handleCreate = () => {
    router.push('/quotations/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/quotations/edit/${id}`);
  };

  const handleView = (id: string) => {
    router.push(`/quotations/view/${id}`);
  };

  // เพิ่มฟังก์ชันนี้ใน QuotationsPage.tsx
const handleDelete = (id: string) => {
  if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
    fetch(`/api/quotations/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          alert('ลบข้อมูลสำเร็จ');
          fetchQuotations();
        } else {
          alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      })
      .catch(err => alert('เกิดข้อผิดพลาด: ' + err.message));
  }
};

  // Generate PDF function
  const handleGeneratePDF = (id: string) => {
    router.push(`/quotations/pdf/${id}`);
  };

  // Table columns
  const columns = [
    {
      title: 'เลขที่ใบเสนอราคา',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
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
      title: 'สถานะลายเซ็น',
      key: 'signatureStatus',
      render: (text: any, record: Quotation) => (
        <Space>
          {record.sellerSignature ? (
            <Tag color="green">ผู้เสนอราคา: มี</Tag>
          ) : (
            <Tag color="red">ผู้เสนอราคา: ไม่มี</Tag>
          )}
          {record.customerSignature ? (
            <Tag color="green">ลูกค้า: มี</Tag>
          ) : (
            <Tag color="red">ลูกค้า: ไม่มี</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: Quotation) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            type="default"
          >
            ดู
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            type="primary"
          >
            แก้ไข
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => handleGeneratePDF(record.id)}
            type="default"
          >
            PDF
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>ใบเสนอราคา</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          สร้างใบเสนอราคา
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={quotations.map(quotation => ({ ...quotation, key: quotation.id }))}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  );
};

export default QuotationsPage;