//quotation-system/src/app/components/quotation/QuotationForm.tsx
'use client';

import React from 'react';
import { Form, Button, Card, Divider, Space, message } from 'antd';
import { SaveOutlined, FilePdfOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// Import sub-components
import QuotationHeader from './components/QuotationHeader';
import QuotationItems from './components/QuotationItems';
import PriceSummary from './components/PriceSummary';
import SignatureSection from './components/SignatureSection';
import CalculatorModal from './components/CalculatorModal';

// Import custom hooks
import { useQuotationData } from './hooks/useQuotationData';
import { useItemsManagement } from './hooks/useItemsManagement';
import { usePriceCalculation } from './hooks/usePriceCalculation';
import { useSignatures } from './hooks/useSignatures';

// Import types
import { Quotation, FormMode } from './types';

interface QuotationFormProps {
  initialData?: Quotation;
  mode: FormMode;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ initialData, mode }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  
  // Use custom hooks
  const { 
    customers, 
    companyProfiles, 
    selectedCustomer, 
    selectedCompany,
    handleCustomerChange,
    handleCompanyChange 
  } = useQuotationData(form, initialData);
  
  const {
    items,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    setItems
  } = useItemsManagement(initialData);
  
  const { 
    calculatedValues,
    includeVat,
    handleVatToggle,
    isCalculatorModalVisible,
    desiredAmount,
    calculatorResult,
    showCalculatorModal,
    handleCalculatorActions
  } = usePriceCalculation(form, items, initialData);
  
  const {
    customerSigCanvas,
    sellerSigCanvas,
    useCompanySignature,
    isSigningCustomer,
    isSigningSeller,
    customerSignature,  // เพิ่มบรรทัดนี้
    sellerSignature,    // เพิ่มบรรทัดนี้
    handleSignatureActions
  } = useSignatures(initialData, selectedCompany);
  
  // Handle saving quotation
  const handleSave = async () => {
    try {
      await form.validateFields();
      
      if (items.length === 0) {
        message.error('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
        return;
      }
      
      // Prepare data and submit
      const quotationData = prepareQuotationData();
      
      if (mode === 'edit' && initialData?.id) {
        await updateQuotation(initialData.id, quotationData);
      } else {
        await createQuotation(quotationData);
      }
      
      router.push('/quotations');
    } catch (error) {
      console.error('Error saving quotation:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกใบเสนอราคา');
    }
  };
  
  // และในส่วนของฟังก์ชัน prepareQuotationData ให้แก้ไขเป็น:
const prepareQuotationData = () => {
  const formValues = form.getFieldsValue();
  
   // ใช้ค่า sellerSignature จาก hook
   let sellerSignatureToUse = null;
   if (useCompanySignature && selectedCompany?.signature) {
     sellerSignatureToUse = selectedCompany.signature;
   } else {
     sellerSignatureToUse = sellerSignature;  // ใช้ค่าจาก hook
   }
  
  return {
    ...formValues,
    issueDate: formValues.issueDate.format('YYYY-MM-DD'),
    companyId: formValues.companyId || selectedCompany?.id,
    includeVat,
    items: items.map(item => ({
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      amount: item.amount,
    })),
    customerSignature: customerSignature,
    sellerSignature: sellerSignatureToUse,
  };
};

  // ใน src/app/components/quotation/QuotationForm.tsx - ตรวจสอบว่ามีการ log ข้อมูลเพิ่มเติมหรือไม่
// ใช้ type จาก interface Quotation ที่มีอยู่แล้ว
const createQuotation = async (data: Omit<Quotation, 'id'>) => {
  try {
    console.log('Sending data to create quotation:', data);
    const res = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const responseText = await res.text();
    console.log('Server response:', responseText, 'Status:', res.status);
    
    if (!res.ok) {
      throw new Error(responseText || 'Failed to create quotation');
    }
    
    message.success('สร้างใบเสนอราคาสำเร็จ');
    const newQuotation = JSON.parse(responseText);
    return newQuotation;
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
};
  
  // Update existing quotation
  const updateQuotation = async (id: string, data: any) => {
    const res = await fetch(`/api/quotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(errorData || 'Failed to update quotation');
    }
    
    message.success('อัพเดทใบเสนอราคาสำเร็จ');
    return await res.json();
  };
  
  // Handle exporting to PDF
  const handleExportPDF = () => {
    if (!initialData?.id) {
      message.error('ต้องบันทึกใบเสนอราคาก่อนจึงจะสามารถส่งออกเป็น PDF ได้');
      return;
    }
    
    router.push(`/quotations/pdf/${initialData.id}`);
  };
  
  return (
    <Card>
      <Form form={form} layout="vertical" disabled={mode === 'view'}>
        {/* Header section with company and customer info */}
        <QuotationHeader 
          form={form}
          customers={customers}
          companyProfiles={companyProfiles}
          selectedCustomer={selectedCustomer}
          selectedCompany={selectedCompany}
          onCustomerChange={handleCustomerChange}
          onCompanyChange={handleCompanyChange}
          mode={mode}
        />
        
        <Divider />
        
        {/* Items section */}
        <QuotationItems 
          items={items}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onItemChange={handleItemChange}
          onCalculatorOpen={showCalculatorModal}
          mode={mode}
        />
        
        <Divider />
        
        {/* Signature and Price Summary sections */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <SignatureSection 
        customerSigCanvas={customerSigCanvas}
        sellerSigCanvas={sellerSigCanvas}
        selectedCompany={selectedCompany}
        initialData={initialData}
        useCompanySignature={useCompanySignature}
        isSigningCustomer={isSigningCustomer}
        isSigningSeller={isSigningSeller}
        // เพิ่ม props ใหม่
        customerSignature={customerSignature}
        sellerSignature={sellerSignature}
        onSignatureAction={handleSignatureActions}
        mode={mode}
      />
          
          <PriceSummary 
            form={form}
            calculatedValues={calculatedValues}
            includeVat={includeVat}
            onVatToggle={handleVatToggle}
            mode={mode}
          />
        </div>
        
        <Divider />
        
        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/quotations')}>
            กลับไปหน้ารายการ
          </Button>
          
          <Space>
            {mode !== 'create' && (
              <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                ส่งออก PDF
              </Button>
            )}
            
            {mode !== 'view' && (
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                {mode === 'create' ? 'บันทึก' : 'อัพเดท'}
              </Button>
            )}
          </Space>
        </div>
      </Form>
      
      {/* Calculator Modal */}
      {/* Calculator Modal */}
<CalculatorModal 
  visible={isCalculatorModalVisible}
  desiredAmount={desiredAmount}
  calculatorResult={calculatorResult}
  onClose={() => handleCalculatorActions.closeModal()}
  onDesiredAmountChange={(amount: number | null) => handleCalculatorActions.setDesiredAmount(amount)}
  onCalculate={() => handleCalculatorActions.calculate()}
  onApply={() => handleCalculatorActions.applyResult(setItems)}
  onUpdateItems={setItems}
/>
    </Card>
  );
};

export default QuotationForm;