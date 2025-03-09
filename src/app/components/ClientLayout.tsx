'use client';
// @ts-ignore
// eslint-disable-next-line
import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import AppHeader from '@/app/components/AppHeader';
import AppNavigation from '@/app/components/AppNavigation';

const { Content } = Layout;

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider
      // @ts-ignore: antd runtime property
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