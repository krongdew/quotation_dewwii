//quotation-system/src/app/components/financial-document/FinancialDocForm.tsx
'use client';

import React, { useState } from 'react';
import { Form, Button, Card, Divider, Space, message, Switch, Select, Input } from 'antd';
import { SaveOutlined, FilePdfOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

// นำเข้า react-datepicker แทน Ant Design DatePicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// นำเข้าคอมโพเนนต์เดิมที่สามารถนำมาใช้ร่วมกับใบเสนอราคาได้
import QuotationItems from '../quotation/components/QuotationItems';
import PriceSummary from '../quotation/components/PriceSummary';
import SignatureSection from '../quotation/components/SignatureSection';

// นำเข้า hooks ที่สามารถใช้ร่วมกันได้
import { useQuotationData } from '../quotation/hooks/useQuotationData';
import { useItemsManagement } from '../quotation/hooks/useItemsManagement';
import { usePriceCalculation } from '../quotation/hooks/usePriceCalculation';
import { useSignatures } from '../quotation/hooks/useSignatures';

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

// Custom DatePicker component ที่ใช้ react-datepicker แทน
interface CustomDatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  placeholder = 'กรุณาเลือกวันที่',
  className = ''
}) => {
  // แปลงค่า value เป็น Date object
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : null;

  return (
    <DatePicker
      selected={dateValue}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      disabled={disabled}
      placeholderText={placeholder}
      className={`ant-input ${className}`}
      style={{ width: '100%' }}
    />
  );
};

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
            onChange={onDocumentTypeChange}
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
            <Input placeholder="เลขที่เอกสาร" disabled={mode === 'view'} />
          </Form.Item>
          
          <Form.Item
            name="issueDate"
            label="วันที่ออกเอกสาร"
            rules={[{ required: true, message: 'กรุณาระบุวันที่ออกเอกสาร' }]}
            getValueProps={(value) => ({ value: value ? new Date(value) : null })}
            getValueFromEvent={(date) => date ? dayjs(date).format('YYYY-MM-DD') : null}
          >
            <CustomDatePicker 
              disabled={mode === 'view'} 
              placeholder="วันที่ออกเอกสาร"
            />
          </Form.Item>
          
          {documentType === 'INVOICE' && (
            <Form.Item
              name="dueDate"
              label="วันครบกำหนดชำระ"
              rules={[{ required: true, message: 'กรุณาระบุวันครบกำหนด' }]}
              getValueProps={(value) => ({ value: value ? new Date(value) : null })}
              getValueFromEvent={(date) => date ? dayjs(date).format('YYYY-MM-DD') : null}
            >
              <CustomDatePicker 
                disabled={mode === 'view'} 
                placeholder="วันครบกำหนดชำระ"
              />
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <Form.Item
              name="isPaid"
              label="สถานะการชำระเงิน"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="ชำระแล้ว" 
                unCheckedChildren="ยังไม่ชำระ" 
                disabled={mode === 'view'}
                defaultChecked
              />
            </Form.Item>
            
            <Form.Item
              name="paymentMethod"
              label="วิธีการชำระเงิน"
              rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระเงิน' }]}
            >
              <Select 
                style={{ width: 200 }}
                disabled={mode === 'view'}
              >
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
              getValueProps={(value) => ({ value: value ? new Date(value) : null })}
              getValueFromEvent={(date) => date ? dayjs(date).format('YYYY-MM-DD') : null}
            >
              <CustomDatePicker 
                disabled={mode === 'view'} 
                placeholder="วันที่ชำระเงิน"
                className="payment-date-picker"
              />
            </Form.Item>
            
            <Form.Item
              name="paymentReference"
              label="หมายเลขอ้างอิงการชำระเงิน"
            >
              <Input 
                placeholder="เลขที่เช็ค, เลขอ้างอิงการโอน" 
                style={{ width: 300 }}
                disabled={mode === 'view'} 
              />
            </Form.Item>
          </div>
        </div>
      )}
    </div>
  );
};

// interface สำหรับฟอร์ม
interface FinancialDocFormProps {
  initialData?: any;
  mode: 'create' | 'edit' | 'view';
}

const FinancialDocForm: React.FC<FinancialDocFormProps> = ({ initialData, mode }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [documentType, setDocumentType] = useState<string | null>(initialData?.documentType || null);
  
  // เตรียมข้อมูลเริ่มต้นสำหรับฟอร์ม
  const prepareInitialValues = () => {
    if (!initialData) {
      return {
        issueDate: new Date(),
      };
    }
    
    return {
      ...initialData,
      // ไม่ต้องแปลงวันที่เป็น dayjs เพราะเราใช้ react-datepicker แล้ว
      issueDate: initialData.issueDate,
      dueDate: initialData.dueDate,
      paymentDate: initialData.paymentDate,
      isPaid: initialData.isPaid || (initialData.documentType === 'RECEIPT') || false,
    };
  };
  
  // ใช้ custom hooks เดียวกับใบเสนอราคา
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
  
  // คำสั่งสำหรับเพิ่ม state สำหรับส่วนลดและภาษีหัก ณ ที่จ่าย
  const [includeDiscount, setIncludeDiscount] = useState(initialData?.discount ? true : false);
  const [includeWithholding, setIncludeWithholding] = useState(initialData?.withholding ? true : false);
  
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
    customerSignature,
    sellerSignature,
    handleSignatureActions
  } = useSignatures(initialData, selectedCompany);
  
  // ฟังก์ชันสำหรับเปิด-ปิดส่วนลดและภาษีหัก ณ ที่จ่าย
  const handleDiscountToggle = (checked: boolean) => {
    setIncludeDiscount(checked);
    if (!checked) {
      form.setFieldsValue({ discount: 0 });
    }
  };

  const handleWithholdingToggle = (checked: boolean) => {
    setIncludeWithholding(checked);
    if (!checked) {
      form.setFieldsValue({ withholding: 0 });
    }
  };
  
  // ฟังก์ชันสำหรับเปลี่ยนประเภทเอกสาร
  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    
    // ถ้าเป็นใบเสร็จ ให้เปลี่ยนค่าเริ่มต้นเป็นชำระแล้ว
    if (value === 'RECEIPT') {
      form.setFieldsValue({ 
        isPaid: true,
        paymentDate: new Date() // ใช้ Date เพราะเราใช้ react-datepicker แล้ว
      });
    }
  };
  
  // เตรียมข้อมูลสำหรับบันทึก
  const prepareDocumentData = () => {
    const formValues = form.getFieldsValue();
    
    // ใช้ค่า sellerSignature จาก hook
    let sellerSignatureToUse = null;
    if (useCompanySignature && selectedCompany?.signature) {
      sellerSignatureToUse = selectedCompany.signature;
    } else {
      sellerSignatureToUse = sellerSignature;
    }
    
    return {
      ...formValues,
      documentType: formValues.documentType,
      // วันที่อาจอยู่ในรูปแบบ Date object ต้องแปลงเป็น string
      issueDate: formValues.issueDate ? dayjs(formValues.issueDate).format('YYYY-MM-DD') : null,
      dueDate: formValues.dueDate ? dayjs(formValues.dueDate).format('YYYY-MM-DD') : null,
      paymentDate: formValues.paymentDate ? dayjs(formValues.paymentDate).format('YYYY-MM-DD') : null,
      quotationId: formValues.quotationId || null,
      companyId: formValues.companyId || selectedCompany?.id,
      includeVat,
      includeDiscount,
      includeWithholding,
      // ถ้าปิดส่วนลดหรือภาษีหัก ณ ที่จ่าย ให้ส่งค่า 0
      discount: includeDiscount ? formValues.discount : 0,
      withholding: includeWithholding ? formValues.withholding : 0,
      items: items.map(item => ({
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        amount: item.amount,
      })),
      customerSignature: customerSignature,
      sellerSignature: sellerSignatureToUse,
      isPaid: formValues.documentType === 'RECEIPT' || formValues.isPaid || false,
    };
  };
  
  // บันทึกข้อมูล
  const handleSave = async () => {
    try {
      await form.validateFields();
      
      if (items.length === 0) {
        message.error('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
        return;
      }
      
      // เตรียมข้อมูลและบันทึก
      const documentData = prepareDocumentData();
      
      if (mode === 'edit' && initialData?.id) {
        await updateDocument(initialData.id, documentData);
      } else {
        await createDocument(documentData);
      }
      
      router.push('/financial-documents');
    } catch (error) {
      console.error('Error saving document:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกเอกสาร');
    }
  };
  
  // สร้างเอกสารใหม่
  const createDocument = async (data: any) => {
    try {
      const res = await fetch('/api/financial-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to create document');
      }
      
      message.success('สร้างเอกสารสำเร็จ');
      return await res.json();
    } catch (error) {
      console.error('Detailed error:', error);
      throw error;
    }
  };
  
  // อัปเดตเอกสารที่มีอยู่
  const updateDocument = async (id: string, data: any) => {
    const res = await fetch(`/api/financial-documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(errorData || 'Failed to update document');
    }
    
    message.success('อัพเดทเอกสารสำเร็จ');
    return await res.json();
  };
  
  // ส่งออกเป็น PDF
  const handleExportPDF = () => {
    if (!initialData?.id) {
      message.error('ต้องบันทึกเอกสารก่อนจึงจะสามารถส่งออกเป็น PDF ได้');
      return;
    }
    
    router.push(`/financial-documents/pdf/${initialData.id}`);
  };
  
  return (
    <Card>
      <Form 
        form={form} 
        layout="vertical" 
        disabled={mode === 'view'}
        initialValues={prepareInitialValues()}
      >
        {/* ส่วนหัวเอกสาร */}
        <FinancialDocHeader 
          form={form}
          customers={customers}
          companyProfiles={companyProfiles}
          selectedCustomer={selectedCustomer}
          selectedCompany={selectedCompany}
          onCustomerChange={handleCustomerChange}
          onCompanyChange={handleCompanyChange}
          mode={mode}
          documentType={documentType}
          onDocumentTypeChange={handleDocumentTypeChange}
        />
        
        <Divider />
        
        {/* ส่วนรายการสินค้า */}
        <QuotationItems 
          items={items}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onItemChange={handleItemChange}
          onCalculatorOpen={showCalculatorModal}
          mode={mode}
        />
        
        <Divider />
        
        {/* ส่วนลายเซ็นและสรุปราคา */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <SignatureSection 
            customerSigCanvas={customerSigCanvas}
            sellerSigCanvas={sellerSigCanvas}
            selectedCompany={selectedCompany}
            initialData={initialData}
            useCompanySignature={useCompanySignature}
            isSigningCustomer={isSigningCustomer}
            isSigningSeller={isSigningSeller}
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
            includeDiscount={includeDiscount}
            onDiscountToggle={handleDiscountToggle}
            includeWithholding={includeWithholding}
            onWithholdingToggle={handleWithholdingToggle}
            mode={mode}
          />
        </div>
        
        <Divider />
        
        {/* ปุ่มดำเนินการ */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/financial-documents')}>
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
    </Card>
  );
};

export default FinancialDocForm;