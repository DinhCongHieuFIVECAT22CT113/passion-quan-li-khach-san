import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/app/components/Sidebar';
import React from 'react';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: 'Hotel Management System',
  description: 'A modern hotel management system',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi" className={inter.className}>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ marginLeft: '240px', width: '100%', padding: '20px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 