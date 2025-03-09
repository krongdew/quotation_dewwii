'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Space, 
  Modal, 
  Form, 
  Input,
  message 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

interface Customer {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  taxId: string;
  contactPerson: string;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Fetch customers data
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('ไม่สามารถโหลดข้อมูลลูกค้าได้');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // Handle modal visibility
  const showModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      form.setFieldsValue(customer);
    } else {
      setEditingCustomer(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCustomer) {
        // Update existing customer
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!res.ok) throw new Error('Failed to update customer');
        message.success('อัพเดทข้อมูลลูกค้าสำเร็จ');
      } else {
        // Create new customer
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!res.ok) throw new Error('Failed to create customer');
        message.success('เพิ่มข้อมูลลูกค้าสำเร็จ');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchCustomers();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };
  
  // Handle customer deletion
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'ยืนยันการลบข้อมูล',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้านี้?',
      okText: 'ใช่',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          const res = await fetch(`/api/customers/${id}`, {
            method: 'DELETE',
          });
          
          if (!res.ok) throw new Error('Failed to delete customer');
          message.success('ลบข้อมูลลูกค้าสำเร็จ');
          fetchCustomers();
        } catch (error) {
          console.error('Error deleting customer:', error);
          message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      },
    });
  };
  
  // Table columns
  const columns = [
    {
      title: 'ชื่อบริษัท',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'ผู้ติดต่อ',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'เลขประจำตัวผู้เสียภาษี',
      dataIndex: 'taxId',
      key: 'taxId',
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: Customer) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            type="primary"
          >
            แก้ไข
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            danger
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>จัดการข้อมูลลูกค้า</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          เพิ่มลูกค้า
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={customers.map(customer => ({ ...customer, key: customer.id }))} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
      {/* Customer Form Modal */}
      <Modal
        title={editingCustomer ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มข้อมูลลูกค้า"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingCustomer ? "อัพเดท" : "บันทึก"}
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="companyName" 
            label="ชื่อบริษัท" 
            rules={[{ required: true, message: 'กรุณากรอกชื่อบริษัท' }]}
          >
            <Input placeholder="ชื่อบริษัท" />
          </Form.Item>
          
          <Form.Item 
            name="contactPerson" 
            label="ชื่อผู้ติดต่อ" 
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ติดต่อ' }]}
          >
            <Input placeholder="ชื่อผู้ติดต่อ" />
          </Form.Item>
          
          <Form.Item 
            name="address" 
            label="ที่อยู่บริษัท" 
            rules={[{ required: true, message: 'กรุณากรอกที่อยู่บริษัท' }]}
          >
            <Input.TextArea rows={3} placeholder="ที่อยู่บริษัท" />
          </Form.Item>
          
          <Form.Item 
            name="phoneNumber" 
            label="เบอร์โทรศัพท์" 
            rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' }]}
          >
            <Input placeholder="เบอร์โทรศัพท์" />
          </Form.Item>
          
          <Form.Item 
            name="email" 
            label="อีเมล" 
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
            ]}
          >
            <Input placeholder="อีเมล" />
          </Form.Item>
          
          <Form.Item 
            name="taxId" 
            label="เลขประจำตัวผู้เสียภาษี" 
            rules={[{ required: true, message: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี' }]}
          >
            <Input placeholder="เลขประจำตัวผู้เสียภาษี" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomersPage;