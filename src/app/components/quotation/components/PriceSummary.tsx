//quotation-system/src/app/components/quotation/components/PriceSummary.tsx
import React from 'react';
import { Card, Row, Col, Typography, InputNumber, Switch, Form } from 'antd';
import { CalculatedValues, FormMode } from '../types';

const { Text, Title } = Typography;

interface PriceSummaryProps {
  form: any;
  calculatedValues: CalculatedValues;
  includeVat: boolean;
  onVatToggle: (checked: boolean) => void;
  mode: FormMode;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  form,
  calculatedValues,
  includeVat,
  onVatToggle,
  mode
}) => {
  // Handle value changes (discount, withholding)
  const handleValueChange = () => {
    // Recalculation is handled by the parent via useEffect
  };

  return (
    <Card title="สรุปราคา" size="small" style={{ flex: 1 }}>
      <Row gutter={[8, 8]}>
        <Col span={16} style={{ textAlign: 'right' }}>
          <Text>ยอดรวม:</Text>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Text>{calculatedValues.subtotal.toLocaleString()} บาท</Text>
        </Col>
        
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text>ส่วนลด:</Text>
        </Col>
        <Col span={12}>
          <Form.Item name="discount" noStyle>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value?: string) => value ? Number(value.replace(/[^\d.]/g, '')) : 0}
              onChange={handleValueChange}
              disabled={mode === 'view'}
            />
          </Form.Item>
        </Col>
        
        <Col span={16} style={{ textAlign: 'right' }}>
          <Text>ยอดรวมหลังหักส่วนลด:</Text>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Text>{calculatedValues.afterDiscount.toLocaleString()} บาท</Text>
        </Col>
        
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text>ภาษีมูลค่าเพิ่ม 7%:</Text>
        </Col>
        <Col span={12}>
          <Switch 
            checked={includeVat} 
            onChange={onVatToggle} 
            disabled={mode === 'view'}
          /> {includeVat ? "คิดภาษี" : "ไม่คิดภาษี"}
        </Col>
        
        {includeVat && (
          <>
            <Col span={16} style={{ textAlign: 'right' }}>
              <Text>ภาษีมูลค่าเพิ่ม 7%:</Text>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Text>{calculatedValues.vat.toLocaleString()} บาท</Text>
            </Col>
          </>
        )}
        
        <Col span={16} style={{ textAlign: 'right' }}>
          <Text>ยอดรวมทั้งสิ้น:</Text>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Text>{calculatedValues.totalAmount.toLocaleString()} บาท</Text>
        </Col>
        
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text>หัก ณ ที่จ่าย 3%:</Text>
        </Col>
        <Col span={12}>
          <Form.Item name="withholding" noStyle>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value?: string) => value ? Number(value.replace(/[^\d.]/g, '')) : 0}
              onChange={handleValueChange}
              disabled={mode === 'view'}
            />
          </Form.Item>
        </Col>
        
        <Col span={16} style={{ textAlign: 'right' }}>
          <Title level={5} style={{ margin: 0 }}>ยอดสุทธิ:</Title>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Title level={5} style={{ margin: 0 }}>{calculatedValues.netTotal.toLocaleString()} บาท</Title>
        </Col>
      </Row>
      
      {/* Hidden fields for calculated values */}
      <Form.Item name="subtotal" hidden><InputNumber /></Form.Item>
      <Form.Item name="afterDiscount" hidden><InputNumber /></Form.Item>
      <Form.Item name="vat" hidden><InputNumber /></Form.Item>
      <Form.Item name="totalAmount" hidden><InputNumber /></Form.Item>
      <Form.Item name="netTotal" hidden><InputNumber /></Form.Item>
      <Form.Item name="includeVat" hidden><InputNumber /></Form.Item>
    </Card>
  );
};

export default PriceSummary;