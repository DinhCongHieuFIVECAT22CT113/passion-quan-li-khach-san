'use client';

import { useState } from 'react';
import styles from './LanguageSelector.module.css';

const languages = [
  { 
    code: 'vi', 
    name: 'Vietnamese',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
        <rect width="900" height="600" fill="#da251d"/>
        <path d="M450 150l113.97 350.83-298.07-216.59h368.2l-298.07 216.59z" fill="#ff0"/>
      </svg>
    )
  },
  { 
    code: 'en', 
    name: 'English',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
        <clipPath id="s">
          <path d="M0,0 v30 h60 v-30 z"/>
        </clipPath>
        <clipPath id="t">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
        </clipPath>
        <g clipPath="url(#s)">
          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
      </svg>
    )
  },
  { 
    code: 'zh', 
    name: 'Chinese',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
        <rect width="900" height="600" fill="#de2910"/>
        <g fill="#ffde00">
          <path d="M225,112.5l27.9,85.8-72.9-53h90l-72.9,53z"/>
          <path d="M354.2,168.8l-10.5,89.3-36.2-82.1 79.8,41.5-89.3-10.5z"/>
          <path d="M354.2,281.3l-53,72.9 0-90 85.8-27.9-85.8-27.9z"/>
          <path d="M354.2,393.8l-89.3-10.5 79.8-41.5-36.2,82.1-10.5-89.3z"/>
          <path d="M225,487.5l-27.9-85.8 72.9,53h-90l72.9-53z"/>
        </g>
      </svg>
    )
  },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
];

const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Selected language:', selectedLanguage);
  };

  return (
    <div className={styles.container}>
      <div className={styles.flagCards}>
        {languages.slice(0, 3).map((lang) => (
          <div 
            key={lang.code}
            className={`${styles.card} ${selectedLanguage === lang.code ? styles.selected : ''}`}
            onClick={() => setSelectedLanguage(lang.code)}
          >
            <div className={styles.flag}>
              {lang.flag}
            </div>
            <span>{lang.name}</span>
          </div>
        ))}
      </div>

      <div className={styles.languageSection}>
        <h3>language</h3>
        <div 
          className={styles.dropdown}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={styles.selected}>
            {languages.find(l => l.code === selectedLanguage)?.name || 'Select language'}
            <span className={`${styles.arrow} ${isOpen ? styles.up : ''}`}>▼</span>
          </div>
          
          {isOpen && (
            <div className={styles.options}>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`${styles.option} ${selectedLanguage === lang.code ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setIsOpen(false);
                  }}
                >
                  {lang.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button className={styles.saveButton} onClick={handleSave}>
        Save
      </button>
    </div>
  );
};

export default LanguageSelector; 