'use client';
import React from 'react';
import WelcomeForm from '../../app/components/welcome/WelcomeForm';
import styles from './WelcomePage.module.css';

const WelcomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <WelcomeForm />
      <div className={styles.imageSection} />
    </div>
  );
};

export default WelcomePage;