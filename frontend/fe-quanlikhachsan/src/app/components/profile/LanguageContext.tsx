'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface LanguageContextType {
  languages: Language[];
  selectedLanguage: string;
  setLanguages: (languages: Language[]) => void;
  setSelectedLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false); // Kiểm tra client-side

  const [languages, setLanguages] = useState<Language[]>([
    { id: 1, name: 'Tiếng Việt', code: 'vi', status: 'Đang sử dụng' },
    { id: 2, name: 'English', code: 'en', status: 'Đang sử dụng' },
    { id: 3, name: '日本語', code: 'ja', status: 'Ngừng sử dụng' },
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi');

  useEffect(() => {
    setIsClient(true);
    // Cập nhật tên ngôn ngữ dựa trên i18n
    const updatedLanguages = [
      { id: 1, name: t('profile.language.vi'), code: 'vi', status: 'Đang sử dụng' },
      { id: 2, name: t('profile.language.en'), code: 'en', status: 'Đang sử dụng' },
      { id: 3, name: t('profile.language.ja'), code: 'ja', status: 'Ngừng sử dụng' },
    ];
    setLanguages(updatedLanguages);

    const savedLanguages = localStorage.getItem('languages');
    if (savedLanguages) {
      setLanguages(JSON.parse(savedLanguages));
    }

    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, [t]);

  useEffect(() => {
    localStorage.setItem('languages', JSON.stringify(languages));
  }, [languages]);

  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  if (!isClient) {
    return null; // Tránh render context trước khi client mount
  }

  return (
    <LanguageContext.Provider value={{ languages, selectedLanguage, setLanguages, setSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};