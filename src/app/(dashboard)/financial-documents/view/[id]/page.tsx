//quotation-system/src/app/(dashboard)/financial-documents/view/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Spin, Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import FinancialDocForm from '../../../../components/financial-document/FinancialDocForm';

const { Title } = Typography;

interface ViewFinancialDocProps {
  params: {
    id: string;
  };
}

const ViewFinancialDocPage: React.FC<ViewFinancialDocProps> = ({ params }) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // ใช้วิธี destructuring โดยตรงเหมือนเดิม
  // (สามารถใช้งานได้ในเวอร์ชัน Next.js ปัจจุบัน)
  const { id } = params;

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

  return (
    <>
      <Title level={2}>
        {document.documentType === 'INVOICE' && 'ใบวางบิล'}
        {document.documentType === 'RECEIPT' && 'ใบเสร็จรับเงิน'}
        {document.documentType === 'TAX_INVOICE' && 'ใบกำกับภาษี'}
        {' - '}{document.documentNumber}
      </Title>
      <FinancialDocForm initialData={document} mode="view" />
    </>
  );
};

export default ViewFinancialDocPage;