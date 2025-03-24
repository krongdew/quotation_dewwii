// src/app/components/AppNavigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  DashboardOutlined,
  BankOutlined,
  FileDoneOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const { Sider } = Layout;

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

const AppNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users/me');
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        // ลบ cookie ในฝั่ง client ถ้าจำเป็น
        document.cookie = 'auth_token=; Max-Age=0; path=/; domain=' + window.location.hostname;
        router.push('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link href="/">หน้าหลัก</Link>,
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: <Link href="/customers">จัดการลูกค้า</Link>,
    },
    {
      key: '/company-profiles',
      icon: <BankOutlined />,
      label: <Link href="/company-profiles">ข้อมูลบริษัท</Link>,
    },
    {
      key: '/quotations',
      icon: <FileTextOutlined />,
      label: <Link href="/quotations">ใบเสนอราคา</Link>,
    },
    {
      key: '/financial-documents',
      icon: <FileDoneOutlined />,
      label: <Link href="/financial-documents">เอกสารทางการเงิน</Link>,
    },
  ];
  
  // เพิ่มเมนูจัดการผู้ใช้สำหรับ Admin
  if (user?.role === 'ADMIN') {
    menuItems.push({
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link href="/users">จัดการผู้ใช้งาน</Link>,
    });
  }
  
  // เพิ่มเมนูตั้งค่าบัญชี
  menuItems.push({
    key: '/account',
    icon: <SettingOutlined />,
    label: <Link href="/account">ตั้งค่าบัญชี</Link>,
  });
  
  return (
    <Sider width={200} style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        selectedKeys={[pathname || '/']}
        style={{ height: 'calc(100% - 50px)', borderRight: 0 }}
        items={menuItems}
      />
      
      <div style={{ padding: '10px', textAlign: 'center' }}>
        <Button 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          danger
          style={{ width: '100%' }}
        >
          ออกจากระบบ
        </Button>
      </div>
    </Sider>
  );
};

export default AppNavigation;