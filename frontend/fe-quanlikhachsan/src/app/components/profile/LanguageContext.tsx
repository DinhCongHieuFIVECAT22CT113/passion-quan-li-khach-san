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
  const [languages, setLanguages] = useState<Language[]>([
    { id: 1, name: 'Tiếng Việt', code: 'vi', status: 'Đang sử dụng' },
    { id: 2, name: 'English', code: 'en', status: 'Đang sử dụng' },
    { id: 3, name: '日本語', code: 'ja', status: 'Đang sử dụng' },
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