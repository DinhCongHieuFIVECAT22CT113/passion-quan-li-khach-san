import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PASSION - Quản Lí Khách Sạn',
  description: 'Hệ thống quản lí khách sạn chuyên nghiệp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.className}>
      <body>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ marginLeft: '240px', width: '100%' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 