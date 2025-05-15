"use client";
import { LanguageProvider } from '../../app/components/profile/LanguageContext';
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../app/i18n';
import { Inter } from 'next/font/google';
import AuthCheck from '../components/auth/AuthCheck';
import { APP_CONFIG } from '../../lib/config';

const inter = Inter({ subsets: ['latin'] });

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Chỉ cho phép người dùng có role customer (R04)
  const customerRoles = [
    APP_CONFIG.roles.customer, // R04
    'CTM' // Legacy code nếu có
  ];
  
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <Suspense fallback={<div>Loading translations...</div>}>
          <AuthCheck requireAuth={true} requiredRoles={customerRoles}>
            {children}
          </AuthCheck>
        </Suspense>
      </LanguageProvider>
    </I18nextProvider>
  );
}