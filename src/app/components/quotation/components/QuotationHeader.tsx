//quotation-system/src/app/components/quotation/components/QuotationHeader.tsx
import React from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Card, Typography } from 'antd';
import { Customer, CompanyProfile, FormMode } from '../types';

const { Option } = Select;
const { Title } = Typography;

interface QuotationHeaderProps {
  form: any;
  customers: Customer[];
  companyProfiles: CompanyProfile[];
  selectedCustomer: Customer | null;
  selectedCompany: CompanyProfile | null;
  onCustomerChange: (customerId: string) => void;
  onCompanyChange: (companyId: string) => void;
  mode: FormMode;
}

const QuotationHeader: React.FC<QuotationHeaderProps> = ({
  form,
  customers,
  companyProfiles,
  selectedCustomer,
  selectedCompany,
  onCustomerChange,
  onCompanyChange,
  mode
}) => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Title level={4}>ข้อมูลใบเสนอราคา</Title>
        
        <Form.Item
          name="companyId"
          label="ผู้เสนอราคา"
          rules={[{ required: true, message: 'กรุณาเลือกผู้เสนอราคา' }]}
        >
          <Select
            placeholder="เลือกบริษัท"
            onChange={onCompanyChange}
            disabled={mode === 'view'}
          >
            {companyProfiles.map(company => (
              <Option key={company.id} value={company.id}>
                {company.companyName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {selectedCompany && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <p><strong>ชื่อบริษัท:</strong> {selectedCompany.companyName}</p>
            <p><strong>ที่อยู่:</strong> {selectedCompany.address}</p>
            <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {selectedCompany.taxId}</p>
            <p><strong>ผู้ติดต่อ:</strong> {selectedCompany.contactPerson}</p>
            <p><strong>เบอร์โทร:</strong> {selectedCompany.phoneNumber}</p>
            <p><strong>อีเมล:</strong> {selectedCompany.email}</p>
          </Card>
        )}
        
        <Form.Item
          name="quotationNumber"
          label="เลขที่ใบเสนอราคา"
          rules={[{ required: true, message: 'กรุณาระบุเลขที่ใบเสนอราคา' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="issueDate"
          label="วันที่"
          rules={[{ required: true, message: 'กรุณาระบุวันที่' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
      </Col>
      
      <Col span={12}>
        <Form.Item
          name="customerId"
          label="ลูกค้า"
          rules={[{ required: true, message: 'กรุณาเลือกลูกค้า' }]}
        >
          <Select
            placeholder="เลือกลูกค้า"
            onChange={onCustomerChange}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>
                {customer.companyName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {selectedCustomer && (
          <Card title="ข้อมูลลูกค้า" size="small">
            <p><strong>ชื่อบริษัท:</strong> {selectedCustomer.companyName}</p>
            <p><strong>ที่อยู่:</strong> {selectedCustomer.address}</p>
            <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {selectedCustomer.taxId}</p>
            <p><strong>ผู้ติดต่อ:</strong> {selectedCustomer.contactPerson}</p>
            <p><strong>เบอร์โทร:</strong> {selectedCustomer.phoneNumber}</p>
            <p><strong>อีเมล:</strong> {selectedCustomer.email}</p>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default QuotationHeader;