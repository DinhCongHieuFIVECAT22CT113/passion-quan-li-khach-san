"use client";
import { LanguageProvider } from '../components/profile/LanguageContext';
import { SearchProvider } from '../components/search/SearchContext';
import { NotificationProvider } from '../components/ui/NotificationSystem';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { PageLoadingOverlay } from '../components/ui/LoadingStates';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <NotificationProvider>
          <LanguageProvider>
            <SearchProvider>
              <Suspense fallback={<PageLoadingOverlay message="Đang tải..." />}>
                {children}
              </Suspense>
            </SearchProvider>
          </LanguageProvider>
        </NotificationProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}