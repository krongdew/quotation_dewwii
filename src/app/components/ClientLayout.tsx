//src/app/components/ClientLayout.tsx
'use client';

import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import AppHeader from '../components/AppHeader';
import AppNavigation from '../components/AppNavigation';

const { Content } = Layout;

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider
      // @ts-expect-error
      disableReactCompatible
    >
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <AppNavigation />
          <Layout style={{ padding: '24px' }}>
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default ClientLayout;