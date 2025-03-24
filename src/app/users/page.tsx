'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Table, Button, Space, Modal, Form, Input, Select, Switch, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'resetPassword'>('add');
  const [form] = Form.useForm();
  const router = useRouter();

  // ดึงข้อมูลผู้ใช้ทั้งหมด
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        if (response.status === 401) {
          // ถ้าไม่ได้รับอนุญาต อาจจะเป็นเพราะไม่ใช่ admin
          message.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // เปิด Modal สำหรับเพิ่มผู้ใช้
  const showAddModal = () => {
    setModalType('add');
    form.resetFields();
    setIsModalVisible(true);
  };

  // เปิด Modal สำหรับแก้ไขผู้ใช้
  const showEditModal = (user: User) => {
    setModalType('edit');
    setCurrentUser(user);
    form.setFieldsValue({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      active: user.active,
    });
    setIsModalVisible(true);
  };

  // เปิด Modal สำหรับรีเซ็ตรหัสผ่าน
  const showResetPasswordModal = (user: User) => {
    setModalType('resetPassword');
    setCurrentUser(user);
    form.resetFields();
    setIsModalVisible(true);
  };

  // ปิด Modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // บันทึกข้อมูลจาก Modal
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalType === 'add') {
        // เพิ่มผู้ใช้ใหม่
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create user');
        }
        
        message.success('เพิ่มผู้ใช้สำเร็จ');
      } else if (modalType === 'edit' && currentUser) {
        // แก้ไขผู้ใช้
        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update user');
        }
        
        message.success('แก้ไขผู้ใช้สำเร็จ');
      } else if (modalType === 'resetPassword' && currentUser) {
        // รีเซ็ตรหัสผ่าน (ส่งอีเมล์)
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reset password');
        }
        
        message.success('ส่งลิงค์รีเซ็ตรหัสผ่านไปยังอีเมล์ของผู้ใช้แล้ว');
      }
      
      setIsModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาด');
    }
  };

  // ลบผู้ใช้
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      message.success('ลบผู้ใช้สำเร็จ');
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const columns = [
    {
      title: 'อีเมล์',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <a href={`mailto:${text}`}>{text}</a>,
    },
    {
      title: 'ชื่อที่แสดง',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
        </Tag>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
        </Tag>
      ),
    },
    {
      title: 'เข้าสู่ระบบล่าสุด',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin: string) => lastLogin ? new Date(lastLogin).toLocaleString('th-TH') : '-',
    },
    {
      title: 'สร้างเมื่อ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => new Date(createdAt).toLocaleDateString('th-TH'),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            size="small"
          >
            แก้ไข
          </Button>
          <Button 
            icon={<KeyOutlined />} 
            onClick={() => showResetPasswordModal(record)}
            size="small"
          >
            รีเซ็ตรหัสผ่าน
          </Button>
          {record.email !== 'dewwiisunny14@gmail.com' && (
            <Popconfirm
              title="คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?"
              onConfirm={() => handleDelete(record.id)}
              okText="ใช่"
              cancelText="ไม่"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                size="small"
              >
                ลบ
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
];

return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>จัดการผู้ใช้งาน</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          เพิ่มผู้ใช้
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          modalType === 'add' ? 'เพิ่มผู้ใช้' : 
          modalType === 'edit' ? 'แก้ไขผู้ใช้' : 
          'รีเซ็ตรหัสผ่าน'
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={
          modalType === 'add' ? 'เพิ่ม' : 
          modalType === 'edit' ? 'บันทึก' : 
          'ส่งลิงค์รีเซ็ต'
        }
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
        >
          {modalType === 'resetPassword' ? (
            <p>ระบบจะส่งอีเมล์ไปยัง {currentUser?.email} เพื่อให้รีเซ็ตรหัสผ่าน</p>
          ) : (
            <>
<Form.Item
  name="email"
  label="อีเมล์"
  rules={[
    { required: true, message: 'กรุณากรอกอีเมล์' },
    { type: 'email', message: 'รูปแบบอีเมล์ไม่ถูกต้อง' }
  ]}
>
  <Input disabled={modalType === 'edit'} />
</Form.Item>
              
              <Form.Item
                name="displayName"
                label="ชื่อที่แสดง"
                rules={[{ required: true, message: 'กรุณากรอกชื่อที่แสดง' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="role"
                label="บทบาท"
                rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
              >
                <Select>
                  <Option value="ADMIN">ผู้ดูแลระบบ</Option>
                  <Option value="USER">ผู้ใช้งาน</Option>
                </Select>
              </Form.Item>
              
              {modalType === 'edit' && (
                <Form.Item
                  name="active"
                  label="สถานะ"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="ใช้งาน" 
                    unCheckedChildren="ไม่ใช้งาน"
                    disabled={currentUser?.email === 'dewwiisunny14@gmail.com'}
                  />
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default UserManagementPage;