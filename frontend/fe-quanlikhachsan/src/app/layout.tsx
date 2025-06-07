import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { LanguageProvider } from './components/profile/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quản lý khách sạn',
  description: 'Hệ thống quản lý khách sạn hiện đại',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
