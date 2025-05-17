'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';
import { useTranslation } from 'react-i18next';

interface PersonalInfoFormProps {
  onSave?: (data: { hokh: string; tenkh: string }) => void;
  onChangePassword?: () => void;
  onPaymentOptions?: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ onSave, onChangePassword, onPaymentOptions }) => {
  const { t } = useTranslation();
  const [hokh, setHokh] = useState('');
  const [tenkh, setTenkh] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [soCccd, setSoCccd] = useState('');

  const [errors, setErrors] = useState({
    hokh: '',
    tenkh: '',
    email: '',
    soDienThoai: '',
    soCccd: '',
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const validateFields = () => {
    const newErrors = {
      hokh: hokh.trim() === '' ? `${t('profile.familyName')} ${t('profile.required')}` : '',
      tenkh: tenkh.trim() === '' ? `${t('profile.givenName')} ${t('profile.required')}` : '',
      email:
        email.trim() === ''
          ? `${t('profile.email')} ${t('profile.required')}`
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? t('profile.invalidEmail')
          : '',
      soDienThoai: soDienThoai.trim() === '' ? `${t('profile.phoneNumber')} ${t('profile.required')}` : !/^\d+$/.test(soDienThoai) ? t('profile.invalidPhone') : '',
      soCccd:
        soCccd.trim() === ''
          ? `${t('profile.idNumber')} ${t('profile.required')}`
          : !/^\d{12}$/.test(soCccd)
          ? t('profile.invalidId')
          : '',
    };
    setErrors(newErrors);

    return Object.values(newErrors).every((err) => err === '');
  };

  const handleSaveInfo = () => {
    if (!validateFields()) return;

    console.log('Lưu thông tin:', {
      hokh,
      tenkh,
      email,
      soDienThoai,
      soCccd,
    });

    setShowSaveSuccess(true);

    if (onSave) {
      onSave({ hokh, tenkh });
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSaveSuccess(false);
  };

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoHeader}>
        <h3>{t('profile.personalInfo')}</h3>
        <button className={styles.actionBtn} onClick={onChangePassword}>
          {t('profile.editPassword')}
        </button>
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>{t('profile.familyName')}</label>
            <input
              type="text"
              value={hokh}
              onChange={(e) => setHokh(e.target.value)}
              placeholder={t('profile.familyNamePlaceholder')}
            />
            {errors.hokh && <p className={styles.error}>{errors.hokh}</p>}
          </div>
        </div>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>{t('profile.givenName')}</label>
            <input
              type="text"
              value={tenkh}
              onChange={(e) => setTenkh(e.target.value)}
              placeholder={t('profile.givenNamePlaceholder')}
            />
            {errors.tenkh && <p className={styles.error}>{errors.tenkh}</p>}
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>{t('profile.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('profile.emailPlaceholder')}
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>{t('profile.idNumber')}</label>
            <input
              type="text"
              value={soCccd}
              onChange={(e) => setSoCccd(e.target.value)}
              placeholder={t('profile.idNumberPlaceholder')}
              maxLength={12}
            />
            {errors.soCccd && <p className={styles.error}>{errors.soCccd}</p>}
          </div>
        </div>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>{t('profile.phoneNumber')}</label>
            <input
              type="tel"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              placeholder={t('profile.phoneNumberPlaceholder')}
            />
            {errors.soDienThoai && <p className={styles.error}>{errors.soDienThoai}</p>}
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button className={styles.saveInfoBtn} onClick={handleSaveInfo}>
          {t('profile.saveChanges')}
        </button>
        <button className={styles.actionBtn} onClick={onPaymentOptions}>
          {t('profile.paymentOptions')}
        </button>
      </div>

      {showSaveSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>{t('profile.savedSuccess')}</h3>
            <button className={styles.modalOkBtn} onClick={handleCloseSuccessModal}>
              {t('profile.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoForm;