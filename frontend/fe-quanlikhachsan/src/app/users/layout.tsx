"use client";
import { LanguageProvider } from '../../app/components/profile/LanguageContext';
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../app/i18n';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <Suspense fallback={<div>Loading translations...</div>}>
          {children}
        </Suspense>
      </LanguageProvider>
    </I18nextProvider>
  );
}