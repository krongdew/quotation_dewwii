//quotation-system/src/app/(dashboard)/quotations/create/page.tsx
'use client';

import React from 'react';
import { Typography } from 'antd';

import QuotationForm from '../../../components/quotation/QuotationForm'; // เปลี่ยนเป็น import จาก index.tsx

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