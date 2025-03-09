//quotation-system/src/app/(dashboard)/quotations/edit/[id]/page.tsx
'use client';
// @ts-ignore
// eslint-disable-next-line
import React, { useState, useEffect } from 'react';
import { Typography, Spin, message } from 'antd';
import QuotationForm from '../../../../components/quotation/QuotationForm'; // เปลี่ยนเป็น import จาก index.tsx
import { useParams } from 'next/navigation';

const { Title } = Typography;

const EditQuotationPage: React.FC = () => {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        console.log('Fetching quotation with ID:', id);
        const res = await fetch(`/api/quotations/${id}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API error:', errorText);
          message.error('ไม่สามารถโหลดข้อมูลใบเสนอราคา: ' + errorText);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        setQuotation(data);
      } catch (error) {
        console.error('Error fetching quotation:', error);
        message.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <>
      <Title level={2}>แก้ไขใบเสนอราคา</Title>
      {quotation && <QuotationForm initialData={quotation} mode="edit" />}
    </>
  );
};

export default EditQuotationPage;