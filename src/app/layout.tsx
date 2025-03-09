import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '../lib/AntdRegistry';
import ClientLayout from './components/ClientLayout';
// @ts-ignore
// eslint-disable-next-line
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ระบบออกใบเสนอราคา',
  description: 'ระบบออกใบเสนอราคาสำหรับการพัฒนาระบบต่าง ๆ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <ClientLayout>{children}</ClientLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}