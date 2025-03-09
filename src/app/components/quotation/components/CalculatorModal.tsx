//quotation-system/src/app/components/quotation/components/CalculatorModal.tsx
import React from 'react';
import { Modal, Button, InputNumber, Space, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { QuotationItem } from '../types';

const { Text } = Typography;

interface CalculatorModalProps {
  visible: boolean;
  desiredAmount: number | null;
  calculatorResult: number | null;
  onClose: () => void;
  onDesiredAmountChange: (amount: number | null) => void;
  onCalculate: () => void;
  onApply: (callback: (items: QuotationItem[]) => void) => void;
  onUpdateItems: (items: QuotationItem[]) => void;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({
  visible,
  desiredAmount,
  calculatorResult,
  onClose,
  onDesiredAmountChange,
  onCalculate,
  onApply,
  onUpdateItems
}) => {
  return (
    <Modal
      title="คำนวณราคาจากยอดสุทธิ"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          ยกเลิก
        </Button>,
        <Button key="calculate" type="primary" onClick={onCalculate}>
          คำนวณ
        </Button>,
        <Button 
          key="apply" 
          type="primary" 
          onClick={() => onApply(onUpdateItems)} 
          disabled={!calculatorResult}
        >
          นำไปใช้
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text>ยอดเงินที่ต้องการหลังหัก ณ ที่จ่าย 3%:</Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            min={0}
            value={desiredAmount || undefined}
            onChange={value => onDesiredAmountChange(value !== null ? value : null)}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value?: string) => value ? Number(value.replace(/[^\d.]/g, '')) : 0}
          />
        </div>
        
        {calculatorResult && (
          <div style={{ marginTop: 16 }}>
            <Text strong>ยอดเงินที่ต้องตั้งก่อนหักภาษี ณ ที่จ่าย:</Text>
            <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8, textAlign: 'center' }}>
              {calculatorResult.toLocaleString()} บาท
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">ภาษีหัก ณ ที่จ่าย 3%: {(calculatorResult * 0.03).toLocaleString()} บาท</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">ยอดสุทธิที่จะได้รับ: {desiredAmount?.toLocaleString()} บาท</Text>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            <QuestionCircleOutlined /> เมื่อนำไปใช้ ระบบจะปรับราคาสินค้าให้ยอดรวมก่อนหักภาษี ณ ที่จ่ายเป็น
            ไปตามที่คำนวณได้
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

export default CalculatorModal;