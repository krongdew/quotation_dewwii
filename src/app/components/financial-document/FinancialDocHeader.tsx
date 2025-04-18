//quotation-system/src/app/components/financial-document/FinancialDocHeader.tsx
// แยกส่วน Header ออกมาเป็นไฟล์ใหม่
'use client';

import React, { useState } from 'react';
import { Form, Divider, Select, DatePicker, Input, Spin, message } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

// Define types for company and customer
interface Company {
  id: string;
  companyName: string;
  address: string;
  taxId?: string;
  phoneNumber?: string;
  email?: string;
  contactPerson: string;
  logo?: string;
  signature?: string;
}

interface Customer {
  id: string;
  companyName: string;
  address: string;
  taxId?: string;
  phoneNumber?: string;
  email?: string;
  contactPerson: string;
}

// สร้างส่วนหัวเอกสารทางการเงิน
interface FinancialDocHeaderProps {
  form: any;
  customers: Customer[];
  companyProfiles: Company[];
  selectedCustomer: Customer | null;
  selectedCompany: Company | null;
  onCustomerChange: (customerId: string) => void;
  onCompanyChange: (companyId: string) => void;
  mode: 'create' | 'edit' | 'view';
  documentType: string | null;
  onDocumentTypeChange: (value: string) => void;
}

const FinancialDocHeader: React.FC<FinancialDocHeaderProps> = ({
  form,
  customers,
  companyProfiles,
  selectedCustomer,
  selectedCompany,
  onCustomerChange,
  onCompanyChange,
  mode,
  documentType,
  onDocumentTypeChange
}) => {
  const [generatingNumber, setGeneratingNumber] = useState(false);

  // ฟังก์ชันสร้างเลขเอกสารอัตโนมัติ
  const generateDocumentNumber = async (type: string) => {
    try {
      // ถ้าไม่ใช่โหมดสร้างใหม่ หรือมีเลขเอกสารอยู่แล้ว ไม่ต้องสร้างใหม่
      if (mode !== 'create' || form.getFieldValue('documentNumber')) {
        return;
      }
      
      setGeneratingNumber(true);
      const res = await fetch('/api/financial-documents/generate-document-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: type }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate document number');
      }
      
      const data = await res.json();
      form.setFieldsValue({ documentNumber: data.documentNumber });
    } catch (error) {
      console.error('Error generating document number:', error);
      message.error('ไม่สามารถสร้างเลขเอกสารอัตโนมัติได้');
    } finally {
      setGeneratingNumber(false);
    }
  };

  // ตรวจสอบการเปลี่ยนประเภทเอกสาร
  const handleTypeChange = (value: string) => {
    // เรียกฟังก์ชันจาก props ก่อน
    onDocumentTypeChange(value);
    
    // สร้างเลขเอกสารอัตโนมัติเมื่อเลือกประเภทเอกสาร
    if (mode === 'create') {
      generateDocumentNumber(value);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Divider orientation="left">ประเภทเอกสาร</Divider>
        <Form.Item
          name="documentType"
          rules={[{ required: true, message: 'กรุณาเลือกประเภทเอกสาร' }]}
        >
          <Select 
            placeholder="เลือกประเภทเอกสาร" 
            onChange={handleTypeChange}
            disabled={mode === 'view'}
          >
            <Option value="INVOICE">ใบวางบิล (Invoice)</Option>
            <Option value="RECEIPT">ใบเสร็จรับเงิน (Receipt)</Option>
            <Option value="TAX_INVOICE">ใบกำกับภาษี (Tax Invoice)</Option>
          </Select>
        </Form.Item>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {/* ข้อมูลเอกสาร */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Divider orientation="left">ข้อมูลเอกสาร</Divider>
          <Form.Item
            name="documentNumber"
            label="เลขที่เอกสาร"
            rules={[{ required: true, message: 'กรุณาระบุเลขที่เอกสาร' }]}
          >
            <Input 
              placeholder={mode === 'create' ? "เลขที่เอกสารจะถูกสร้างอัตโนมัติเมื่อเลือกประเภทเอกสาร" : "เลขที่เอกสาร"} 
              disabled={mode === 'view' || generatingNumber}
              suffix={generatingNumber ? <Spin size="small" /> : null}
            />
          </Form.Item>
          
          <Form.Item
            name="issueDate"
            label="วันที่ออกเอกสาร"
            rules={[{ required: true, message: 'กรุณาระบุวันที่ออกเอกสาร' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabled={mode === 'view'} />
          </Form.Item>
          
          {documentType === 'INVOICE' && (
            <Form.Item
              name="dueDate"
              label="วันครบกำหนดชำระ"
              rules={[{ required: true, message: 'กรุณาระบุวันครบกำหนด' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabled={mode === 'view'} />
            </Form.Item>
          )}
          
          {/* ข้อมูลใบเสนอราคาอ้างอิง (ถ้ามี) */}
          <Form.Item
            name="quotationId"
            label="อ้างอิงใบเสนอราคา"
          >
            <Input placeholder="เลขที่ใบเสนอราคา" disabled={true} />
          </Form.Item>
        </div>
        
        {/* ข้อมูลลูกค้า */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Divider orientation="left">ข้อมูลลูกค้า</Divider>
          <Form.Item
            name="customerId"
            label="ลูกค้า"
            rules={[{ required: true, message: 'กรุณาเลือกลูกค้า' }]}
          >
            <Select 
              placeholder="เลือกลูกค้า" 
              onChange={onCustomerChange}
              disabled={mode === 'view'}
            >
              {customers.map((customer: Customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.companyName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {selectedCustomer && (
            <>
              <div>ที่อยู่: {selectedCustomer.address}</div>
              {selectedCustomer.taxId && <div>เลขประจำตัวผู้เสียภาษี: {selectedCustomer.taxId}</div>}
              {selectedCustomer.phoneNumber && <div>เบอร์โทร: {selectedCustomer.phoneNumber}</div>}
              {selectedCustomer.email && <div>อีเมล: {selectedCustomer.email}</div>}
              <div>ผู้ติดต่อ: {selectedCustomer.contactPerson}</div>
            </>
          )}
        </div>
        
        {/* ข้อมูลบริษัท */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Divider orientation="left">ข้อมูลผู้ออกเอกสาร</Divider>
          <Form.Item
            name="companyId"
            label="บริษัท"
            rules={[{ required: true, message: 'กรุณาเลือกบริษัท' }]}
          >
            <Select 
              placeholder="เลือกบริษัท" 
              onChange={onCompanyChange}
              disabled={mode === 'view'}
            >
              {companyProfiles.map((company: Company) => (
                <Option key={company.id} value={company.id}>
                  {company.companyName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {selectedCompany && (
            <>
              <div>ที่อยู่: {selectedCompany.address}</div>
              {selectedCompany.taxId && <div>เลขประจำตัวผู้เสียภาษี: {selectedCompany.taxId}</div>}
              {selectedCompany.phoneNumber && <div>เบอร์โทร: {selectedCompany.phoneNumber}</div>}
              {selectedCompany.email && <div>อีเมล: {selectedCompany.email}</div>}
              <div>ผู้ติดต่อ: {selectedCompany.contactPerson}</div>
            </>
          )}
        </div>
      </div>
      
      {/* แสดงข้อมูลการชำระเงินสำหรับใบเสร็จ */}
      {documentType === 'RECEIPT' && (
        <div>
          <Divider orientation="left">ข้อมูลการชำระเงิน</Divider>
          {/* ... เนื้อหาส่วนข้อมูลการชำระเงิน (คงเดิม) ... */}
        </div>
      )}
    </div>
  );
};

export default FinancialDocHeader;