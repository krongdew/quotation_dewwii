// quotation-system/src/app/components/financial-document/CreateFinancialDocModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Option } = Select;

interface CreateFinancialDocModalProps {
  visible: boolean;
  quotationId: string;
  quotationNumber: string;
  onClose: () => void;
}

const CreateFinancialDocModal: React.FC<CreateFinancialDocModalProps> = ({
  visible,
  quotationId,
  quotationNumber,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const router = useRouter();

  // Generate document number based on document type and current date
  const generateDocumentNumber = (type: string) => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    let prefix = '';
    switch (type) {
      case 'INVOICE':
        prefix = 'INV';
        break;
      case 'RECEIPT':
        prefix = 'REC';
        break;
      case 'TAX_INVOICE':
        prefix = 'TAX';
        break;
      default:
        prefix = 'DOC';
    }
    
    return `${prefix}${year}${month}-001`;
  };

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    
    // Generate and set document number
    const documentNumber = generateDocumentNumber(value);
    form.setFieldsValue({ documentNumber });
    
    // Set payment fields if it's a receipt
    if (value === 'RECEIPT') {
      form.setFieldsValue({ 
        isPaid: true,
        paymentDate: dayjs() 
      });
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      const values = form.getFieldsValue();
      
      const payload = {
        quotationId,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        issueDate: values.issueDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        isPaid: values.documentType === 'RECEIPT',  // ถ้าเป็นใบเสร็จรับเงิน ให้ isPaid = true
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate ? values.paymentDate.format('YYYY-MM-DD') : null,
        paymentReference: values.paymentReference,
      };
      
      // ส่งข้อมูลไปสร้างเอกสารทางการเงิน
      const response = await fetch('/api/financial-documents/create-from-quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'เกิดข้อผิดพลาดในการสร้างเอกสาร');
      }
      
      const result = await response.json();
      
      message.success('สร้างเอกสารทางการเงินสำเร็จ');
      onClose();
      
      // นำทางไปยังหน้าแสดงเอกสารที่สร้างใหม่
      router.push(`/financial-documents/view/${result.id}`);
    } catch (error) {
      console.error('Error creating financial document:', error);
      message.error('เกิดข้อผิดพลาดในการสร้างเอกสารทางการเงิน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="สร้างเอกสารทางการเงินจากใบเสนอราคา"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          ยกเลิก
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          สร้างเอกสาร
        </Button>,
      ]}
      width={600}
    >
      <Form 
        form={form}
        layout="vertical"
        initialValues={{
          issueDate: dayjs(),
        }}
      >
        <Form.Item
          name="quotationRef"
          label="อ้างอิงใบเสนอราคา"
        >
          <Input value={quotationNumber} readOnly />
        </Form.Item>
        
        <Form.Item
          name="documentType"
          label="ประเภทเอกสาร"
          rules={[{ required: true, message: 'กรุณาเลือกประเภทเอกสาร' }]}
        >
          <Select onChange={handleDocumentTypeChange}>
            <Option value="INVOICE">ใบวางบิล (Invoice)</Option>
            <Option value="RECEIPT">ใบเสร็จรับเงิน (Receipt)</Option>
            <Option value="TAX_INVOICE">ใบกำกับภาษี (Tax Invoice)</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="documentNumber"
          label="เลขที่เอกสาร"
          rules={[{ required: true, message: 'กรุณาระบุเลขที่เอกสาร' }]}
        >
          <Input placeholder="ระบุเลขที่เอกสาร" />
        </Form.Item>
        
        <Form.Item
          name="issueDate"
          label="วันที่ออกเอกสาร"
          rules={[{ required: true, message: 'กรุณาระบุวันที่ออกเอกสาร' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>
        
        {/* แสดงฟิลด์วันครบกำหนดสำหรับใบวางบิล */}
        {documentType === 'INVOICE' && (
          <Form.Item
            name="dueDate"
            label="วันครบกำหนดชำระ"
            rules={[{ required: true, message: 'กรุณาระบุวันครบกำหนด' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        )}
        
        {/* แสดงฟิลด์การชำระเงินสำหรับใบเสร็จ */}
        {documentType === 'RECEIPT' && (
          <>
            <Form.Item
              name="paymentMethod"
              label="วิธีการชำระเงิน"
              rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระเงิน' }]}
            >
              <Select>
                <Option value="CASH">เงินสด</Option>
                <Option value="TRANSFER">โอนเงิน</Option>
                <Option value="CHECK">เช็ค</Option>
                <Option value="CREDIT_CARD">บัตรเครดิต</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="paymentDate"
              label="วันที่ชำระเงิน"
              rules={[{ required: true, message: 'กรุณาระบุวันที่ชำระเงิน' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="paymentReference"
              label="หมายเลขอ้างอิงการชำระเงิน"
            >
              <Input placeholder="เลขที่เช็ค, เลขอ้างอิงการโอน" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CreateFinancialDocModal;