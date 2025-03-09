//quotation-system/src/app/(dashboard)/quotations/view/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Spin, message } from 'antd';
import QuotationForm from '../../../../components/quotation/QuotationForm'; // เปลี่ยนเป็น import จาก index.tsx
import { useParams } from 'next/navigation';
// @ts-ignore
// eslint-disable-next-line
const { Title } = Typography;

const ViewQuotationPage: React.FC = () => {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  // Fetch quotation data
  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await fetch(`/api/quotations/${id}`);
        if (!res.ok) throw new Error('Failed to fetch quotation');
        const data = await res.json();
        setQuotation(data);
      } catch (error) {
        console.error('Error fetching quotation:', error);
        message.error('ไม่สามารถโหลดข้อมูลใบเสนอราคาได้');
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
      <Title level={2}>รายละเอียดใบเสนอราคา</Title>
      {quotation && <QuotationForm initialData={quotation} mode="view" />}
    </>
  );
};

export default ViewQuotationPage;