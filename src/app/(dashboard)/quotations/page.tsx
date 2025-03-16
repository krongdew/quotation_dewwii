//quotation-system/src/app/(dashboard)/quotations/page.tsx
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
  Modal,
  Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FilePdfOutlined, 
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

// นำเข้าคอมโพเนนต์โมดัลสร้างเอกสารทางการเงิน
import CreateFinancialDocModal from '../../components/financial-document/CreateFinancialDocModal';

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
  // สถานะสำหรับโมดัลสร้างเอกสารทางการเงิน
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      fetch(`/api/quotations/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            message.success('ลบข้อมูลสำเร็จ');
            fetchQuotations();
          } else {
            message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
          }
        })
        .catch(err => message.error('เกิดข้อผิดพลาด: ' + err.message));
    }
  };

  // Generate PDF function
  const handleGeneratePDF = (id: string) => {
    router.push(`/quotations/pdf/${id}`);
  };
  
  // เปิดโมดัลสร้างเอกสารทางการเงิน
  const handleCreateFinancialDoc = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsModalVisible(true);
  };

  // ปิดโมดัลสร้างเอกสารทางการเงิน
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedQuotation(null);
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
          <Tooltip title="สร้างเอกสารทางการเงิน">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => handleCreateFinancialDoc(record)}
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
      
      {/* โมดัลสร้างเอกสารทางการเงิน */}
      {selectedQuotation && (
        <CreateFinancialDocModal
          visible={isModalVisible}
          quotationId={selectedQuotation.id}
          quotationNumber={selectedQuotation.quotationNumber}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default QuotationsPage;