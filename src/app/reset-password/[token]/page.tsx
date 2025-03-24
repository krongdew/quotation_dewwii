// src/app/reset-password/[token]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  // ใช้ useParams แทน props
  const token = Array.isArray(params?.token) 
    ? params.token[0] 
    : params?.token as string;

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      return message.error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: values.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Reset password failed');
      }

      message.success('รีเซ็ตรหัสผ่านสำเร็จ');
      router.push('/login');
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>รีเซ็ตรหัสผ่าน</Title>
          <Text>กรุณากำหนดรหัสผ่านใหม่</Text>
        </div>
        
        <Form
          name="resetPassword"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'กรุณากรอกรหัสผ่าน' },
              { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่านใหม่" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="ยืนยันรหัสผ่านใหม่" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }} size="large">
              บันทึกรหัสผ่านใหม่
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;