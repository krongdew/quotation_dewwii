'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Card, Form, Input, Button, Tabs, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

const AccountSettingsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users/me');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData);
        
        // ตั้งค่าข้อมูลเริ่มต้นสำหรับฟอร์ม
        profileForm.setFieldsValue({
          displayName: userData.displayName,
          email: userData.email,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, [profileForm]);

  // อัพเดตข้อมูลส่วนตัว
  const handleProfileUpdate = async (values: { displayName: string }) => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      message.success('อัพเดตข้อมูลส่วนตัวสำเร็จ');
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการอัพเดตข้อมูลส่วนตัว');
    } finally {
      setSubmitting(false);
    }
  };

  // เปลี่ยนรหัสผ่าน
  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (!user) return;
    
    if (values.newPassword !== values.confirmPassword) {
      return message.error('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }
      
      message.success('เปลี่ยนรหัสผ่านสำเร็จ');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Title level={2}>ตั้งค่าบัญชี</Title>
      
      <Tabs defaultActiveKey="profile">
        <TabPane tab="ข้อมูลส่วนตัว" key="profile">
          <Card>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Form.Item
                label="อีเมล์"
                name="email"
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>
              
              <Form.Item
                label="ชื่อที่แสดง"
                name="displayName"
                rules={[{ required: true, message: 'กรุณากรอกชื่อที่แสดง' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  บันทึกข้อมูล
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="เปลี่ยนรหัสผ่าน" key="password">
          <Card>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                label="รหัสผ่านปัจจุบัน"
                name="currentPassword"
                rules={[{ required: true, message: 'กรุณากรอกรหัสผ่านปัจจุบัน' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                label="รหัสผ่านใหม่"
                name="newPassword"
                rules={[
                  { required: true, message: 'กรุณากรอกรหัสผ่านใหม่' },
                  { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                label="ยืนยันรหัสผ่านใหม่"
                name="confirmPassword"
                rules={[
                  { required: true, message: 'กรุณายืนยันรหัสผ่านใหม่' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  เปลี่ยนรหัสผ่าน
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </>
  );
};

export default AccountSettingsPage;