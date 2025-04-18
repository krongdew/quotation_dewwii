'use client';

import React, { useState, Suspense } from 'react';
import { Form, Input, Button, Typography, Card, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

// สร้าง component แยกสำหรับส่วนที่ใช้ useSearchParams
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('from') || '/';
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', values.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      console.log('Login response status:', response.status);
      
      // อ่านข้อมูล response ก่อนจะตรวจสอบรหัสสถานะ
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Login response text:', responseText);
        
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log('Login response data:', responseData);
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
      }
      
      // ตรวจสอบรหัสสถานะและแสดงข้อความ error ที่เหมาะสม
      if (response.status === 401) {
        // ใช้ alert แทน message เพื่อให้แน่ใจว่าจะเห็นข้อความ
        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }
      
      if (response.status === 403) {
        alert('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }
      
      if (!response.ok) {
        const errorMessage = responseData?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
        alert(errorMessage);
        return;
      }
      
      // แสดงข้อความสำเร็จ
      alert('เข้าสู่ระบบสำเร็จ');
      
      // ใช้ window.location.href แทน router.push เพื่อโหลดหน้าใหม่ทั้งหมด
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    const email = form.getFieldValue('email');
    
    if (!email) {
      return message.error('กรุณากรอกอีเมล์ก่อนกดลืมรหัสผ่าน');
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Reset password request failed');
      }

      message.success('หากอีเมล์นี้มีอยู่ในระบบ เราได้ส่งลิงค์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมล์ของคุณแล้ว');
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      name="login"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      layout="vertical"
    >
      <Form.Item
        name="email"
        rules={[{ required: true, message: 'กรุณากรอกอีเมล์' }, { type: 'email', message: 'รูปแบบอีเมล์ไม่ถูกต้อง' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="อีเมล์" size="large" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" size="large" />
      </Form.Item>

      <Form.Item>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }} size="large">
            เข้าสู่ระบบ
          </Button>
          <Button type="link" onClick={handleForgotPassword} style={{ width: '100%', padding: 0 }}>
            ลืมรหัสผ่าน?
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

// Component หลักที่จะถูกเรียกใช้โดย Next.js
const LoginPage = () => {
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
          <Title level={2} style={{ margin: 0 }}>ระบบใบเสนอราคา</Title>
          <Text>กรุณาเข้าสู่ระบบ</Text>
        </div>
        
        <Suspense fallback={<div>กำลังโหลด...</div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
};

export default LoginPage;