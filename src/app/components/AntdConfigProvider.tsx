// src/app/components/AntdConfigProvider.tsx
'use client';

import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { ConfigProviderProps } from 'antd/es/config-provider';

// ทำ type assertion เพื่อเพิ่ม property
interface ExtendedConfigProviderProps extends ConfigProviderProps {
  disableReactCompatible?: boolean;
}

export default function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  // สร้าง props ให้กับ ConfigProvider ด้วย type assertion
  const configProps = {
    disableReactCompatible: true
  } as ExtendedConfigProviderProps;

  return (
    <ConfigProvider {...configProps}>
      {children}
    </ConfigProvider>
  );
}