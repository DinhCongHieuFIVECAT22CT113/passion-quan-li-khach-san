'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Language {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface LanguageContextType {
  languages: Language[];
  selectedLanguage: string;
  setSelectedLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [languages, /*setLanguages*/] = useState<Language[]>([
  { id: 1, name: 'Tiếng Việt', code: 'vi', status: 'Đang sử dụng' },
  { id: 2, name: '한국어', code: 'ko', status: 'Đang sử dụng' }, // Tiếng Hàn
  { id: 3, name: '日本語', code: 'ja', status: 'Đang sử dụng' }, // Nhật
  { id: 4, name: '中文', code: 'zh', status: 'Đang sử dụng' }, // Trung
  { id: 5, name: 'ภาษาไทย', code: 'th', status: 'Đang sử dụng' }, // Thái
  { id: 6, name: 'English', code: 'en', status: 'Đang sử dụng' }, // Anh 
  { id: 7, name: 'Deutsch', code: 'de', status: 'Đang sử dụng' }, // Đức
  { id: 8, name: 'Français', code: 'fr', status: 'Đang sử dụng' }, // Pháp
  { id: 9, name: 'Русский', code: 'ru', status: 'Đang sử dụng' }, // Tiếng Nga
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi');

  return (
    <LanguageContext.Provider
      value={{
        languages,
        selectedLanguage,
        setSelectedLanguage,
      }}
    >
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