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
  phoneNumber: string | null;
  email: string | null;
  taxId: string | null;
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
      
      // เตรียมข้อมูลสำหรับส่งไป API
      const formData = {
        ...values,
        // ตั้งค่า empty string เป็น null สำหรับฟิลด์ optional
        phoneNumber: values.phoneNumber || null,
        email: values.email || null,
        taxId: values.taxId || null
      };
      
      if (editingCustomer) {
        // Update existing customer
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to update customer' }));
          throw new Error(errorData.error || 'Failed to update customer');
        }
        message.success('อัพเดทข้อมูลลูกค้าสำเร็จ');
      } else {
        // Create new customer
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to create customer' }));
          throw new Error(errorData.error || 'Failed to create customer');
        }
        message.success('เพิ่มข้อมูลลูกค้าสำเร็จ');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchCustomers();
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      message.error(errorMessage);
    }
  };
  
  // สำหรับ Customer Page
const handleDelete = async (id: string) => {
  // ใช้ confirm แทน Modal
  const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้านี้?');
  
  if (confirmDelete) {
    try {
      console.log('Deleting customer with ID:', id);
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response status:', res.status);
      
      // ถ้าสถานะเป็น 204 (No Content) แสดงว่าลบสำเร็จ
      if (res.status === 204) {
        message.success('ลบข้อมูลลูกค้าสำเร็จ');
        fetchCustomers();
        return;
      }
      
      // ถ้าไม่ใช่ 204 ให้พยายามอ่านข้อความผิดพลาด
      let errorMsg = 'Failed to delete customer';
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // กรณีไม่สามารถอ่าน JSON ได้
        if (res.status === 404) {
          errorMsg = 'ไม่พบข้อมูลลูกค้า';
        } else if (res.status === 400) {
          errorMsg = 'ไม่สามารถลบข้อมูลที่มีการใช้งานอยู่ได้';
        }
      }
      
      throw new Error(errorMsg);
    } catch (error) {
      console.error('Error deleting customer:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการลบข้อมูล';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      message.error(errorMessage);
    }
  }
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
      render: (text: string | null) => text || '-'
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
      render: (text: string | null) => text || '-'
    },
    {
      title: 'เลขประจำตัวผู้เสียภาษี',
      dataIndex: 'taxId',
      key: 'taxId',
      render: (text: string | null) => text || '-'
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
          >
            <Input placeholder="เบอร์โทรศัพท์" />
          </Form.Item>
          
          <Form.Item 
            name="email" 
            label="อีเมล" 
            rules={[
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
            ]}
          >
            <Input placeholder="อีเมล" />
          </Form.Item>
          
          <Form.Item 
            name="taxId" 
            label="เลขประจำตัวผู้เสียภาษี"
          >
            <Input placeholder="เลขประจำตัวผู้เสียภาษี" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomersPage;