//quotation-system/src/app/components/quotation/components/QuotationItems.tsx
import React from 'react';
import { Button, Table, Input, InputNumber, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, CalculatorOutlined } from '@ant-design/icons';
import { QuotationItem, FormMode } from '../types';

const { Title } = Typography;

interface QuotationItemsProps {
  items: QuotationItem[];
  onAddItem: () => void;
  onRemoveItem: (key: string) => void;
  onItemChange: (key: string, field: keyof QuotationItem, value: any) => void;
  onCalculatorOpen: () => void;
  mode: FormMode;
}

const QuotationItems: React.FC<QuotationItemsProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onItemChange,
  onCalculatorOpen,
  mode
}) => {
  // Define columns for the items table
  const columns = [
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (text: string, record: QuotationItem) => (
        <Input
          value={text}
          onChange={e => onItemChange(record.key, 'description', e.target.value)}
          disabled={mode === 'view'}
        />
      ),
    },
    {
      title: 'หน่วย',
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
      render: (text: string, record: QuotationItem) => (
        <Input
          value={text}
          onChange={e => onItemChange(record.key, 'unit', e.target.value)}
          disabled={mode === 'view'}
        />
      ),
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (value: number, record: QuotationItem) => (
        <InputNumber
          min={1}
          value={value}
          onChange={val => onItemChange(record.key, 'quantity', val || 0)}
          style={{ width: '100%' }}
          disabled={mode === 'view'}
        />
      ),
    },
    {
      title: 'ราคาต่อหน่วย',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      width: '15%',
      render: (value: number, record: QuotationItem) => (
        <InputNumber
          min={0}
          value={value}
          onChange={val => onItemChange(record.key, 'pricePerUnit', val || 0)}
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value?: string) => value ? Number(value.replace(/[^\d.]/g, '')) : 0}
          disabled={mode === 'view'}
        />
      ),
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      width: '15%',
      render: (value: number) => (
        <InputNumber
          value={value}
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          disabled
        />
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: '10%',
      render: (_: any, record: QuotationItem) => (
        mode !== 'view' ? (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onRemoveItem(record.key)}
          />
        ) : null
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>รายการสินค้า/บริการ</Title>
        {mode !== 'view' && (
          <Button 
            type="default" 
            icon={<CalculatorOutlined />} 
            onClick={onCalculatorOpen}
          >
            คำนวณราคาจากยอดสุทธิ
          </Button>
        )}
      </div>
      
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        rowKey="key"
        bordered
      />
      
      {mode !== 'view' && (
        <Button
          type="dashed"
          onClick={onAddItem}
          style={{ width: '100%', marginTop: 16 }}
          icon={<PlusOutlined />}
        >
          เพิ่มรายการ
        </Button>
      )}
    </>
  );
};

export default QuotationItems;