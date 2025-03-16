//quotation-system/src/app/(dashboard)/financial-documents/create/page.tsx
'use client';

import React from 'react';
import { Typography } from 'antd';
import FinancialDocForm from '../../../components/financial-document/FinancialDocForm';

const { Title } = Typography;



const CreateFinancialDocPage: React.FC = () => {
  return (
    <>
      <Title level={2}>สร้างเอกสารทางการเงิน</Title>
      <FinancialDocForm mode="create" />
    </>
  );
};

export default CreateFinancialDocPage;

