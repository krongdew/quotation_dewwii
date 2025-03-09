//quotation-system/src/app/(dashboard)/quotations/create/page.tsx
'use client';
// @ts-ignore
// eslint-disable-next-line
import React from 'react';
import { Typography } from 'antd';
import QuotationForm from '@/app/components/quotation'; // เปลี่ยนเป็น import จาก index.tsx

const { Title } = Typography;

const CreateQuotationPage: React.FC = () => {
  return (
    <>
      <Title level={2}>สร้างใบเสนอราคา</Title>
      <QuotationForm mode="create" />
    </>
  );
};

export default CreateQuotationPage;