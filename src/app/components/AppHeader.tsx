'use client';

import React from 'react';
import { Layout, Typography } from 'antd';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
  return (
    <Header style={{ background: '#fff', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>ระบบใบเสนอราคา</Title>
      </div>
    </Header>
  );
};

export default AppHeader;