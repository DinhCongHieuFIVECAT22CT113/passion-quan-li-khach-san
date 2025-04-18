'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const languages = [
  { code: 'vi', name: 'Vietnamese', flag: '/images/flags/vn.png' },
  { code: 'en', name: 'English', flag: '/images/flags/gb.png' },
  { code: 'zh', name: 'Trung quốc', flag: '/images/flags/cn.png' },
  { code: 'hi', name: 'Hindi', flag: '/images/flags/in.png' },
  { code: 'es', name: 'Spanish', flag: '/images/flags/es.png' },
  { code: 'fr', name: 'French', flag: '/images/flags/fr.png' },
  { code: 'ar', name: 'Arabic', flag: '/images/flags/sa.png' },
  { code: 'bn', name: 'Bengali', flag: '/images/flags/bd.png' },
  { code: 'ru', name: 'Russian', flag: '/images/flags/ru.png' },
  { code: 'pt', name: 'Portuguese', flag: '/images/flags/pt.png' }
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  const handleLanguageSelect = (language: typeof languages[0]) => {
    setSelectedLang(language);
    setIsOpen(false);
    // TODO: Implement language change logic
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Services</h1>
      
      <div className={styles.languageCards}>
        {languages.slice(0, 3).map((lang) => (
          <div key={lang.code} className={styles.card} onClick={() => handleLanguageSelect(lang)}>
            <Image src={lang.flag} alt={lang.name} width={48} height={48} className={styles.flag} />
            <span>{lang.name}</span>
          </div>
        ))}
      </div>

      <h2 className={styles.subtitle}>language</h2>
      
      <div className={styles.selector}>
        <div className={styles.selectedLanguage} onClick={() => setIsOpen(!isOpen)}>
          <span>Select language</span>
          <svg
            className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {isOpen && (
          <div className={styles.dropdown}>
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={styles.option}
                onClick={() => handleLanguageSelect(lang)}
              >
                {lang.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={styles.saveButton}>Save</button>
    </div>
  );
} 