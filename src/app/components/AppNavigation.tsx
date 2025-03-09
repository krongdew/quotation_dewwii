'use client';
// @ts-ignore
// eslint-disable-next-line
import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  DashboardOutlined,
  BankOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider } = Layout;

const AppNavigation: React.FC = () => {
  const pathname = usePathname();

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
  ];
  
  return (
    <Sider width={200} style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppNavigation;