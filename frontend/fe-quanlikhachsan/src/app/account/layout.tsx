// app/dashboard/account/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import Sidebar from '@/app/components/Sidebar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function AccLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', width: '100%', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}