"use client";
import { LanguageProvider } from '../../app/components/profile/LanguageContext';
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../app/i18n';
// import AuthCheck from '../components/auth/AuthCheck'; // Bỏ AuthCheck
// import { APP_CONFIG } from '../../lib/config'; // Bỏ APP_CONFIG nếu không dùng nữa

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bỏ logic customerRoles và AuthCheck
  // const customerRoles = [
  //   APP_CONFIG.roles.customer, // R04
  //   'CTM' // Legacy code nếu có
  // ];
  
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <Suspense fallback={<div>Loading translations...</div>}>
          {/* <AuthCheck requireAuth={true} requiredRoles={customerRoles}> */}
            {children}
          {/* </AuthCheck> */}
        </Suspense>
      </LanguageProvider>
    </I18nextProvider>
  );
}