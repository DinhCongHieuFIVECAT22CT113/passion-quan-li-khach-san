'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Welcome.module.css';

const WelcomeForm: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.formSection}>
      <h2 className={styles.title}>Chào Mừng</h2>
      
      <div className={styles.formWrapper}>
        <button 
          className={styles.mainBtn}
          onClick={() => router.push('/login')}
        >
          Đăng Nhập
        </button>
        
        <button 
          className={`${styles.mainBtn} ${styles.signupBtn}`}
          onClick={() => router.push('/signup')}
        >
          Đăng Ký
        </button>
      </div>

      <footer className={styles.footer}>© 2025 BẢN QUYỀN ĐƯỢC BẢO LƯU</footer>
    </div>
  );
};

export default WelcomeForm;