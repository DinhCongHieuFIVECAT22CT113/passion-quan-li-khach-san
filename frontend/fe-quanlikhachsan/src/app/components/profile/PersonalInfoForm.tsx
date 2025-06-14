'use client';
import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { useTranslation } from 'react-i18next';

interface PersonalInfoFormProps {
  onSave?: (data: { hokh: string; tenkh: string; email: string; soDienThoai: string; soCccd: string; diaChi: string }) => void; // Cập nhật cả onSave
  onCancel?: () => void;
  onChangePassword?: () => void;
  onPaymentOptions?: () => void;
  initialValues?: {
    hokh: string;
    tenkh: string;
    email: string;
    soDienThoai: string;
    soCccd: string;
    diaChi: string; // Thêm trường địa chỉ
  };
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  onSave, 
  onCancel, 
  onChangePassword, 
  onPaymentOptions, 
  initialValues 
}) => {
  const { t } = useTranslation();
  const [hokh, setHokh] = useState('');
  const [tenkh, setTenkh] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [soCccd, setSoCccd] = useState('');
  const [diaChi, setDiaChi] = useState(''); // Thêm state cho địa chỉ

  const [errors, setErrors] = useState({
    hokh: '',
    tenkh: '',
    email: '',
    soDienThoai: '',
    soCccd: '',
    diaChi: '', // Thêm lỗi cho địa chỉ
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Khởi tạo giá trị từ initialValues - chỉ chạy một lần khi component mount
  useEffect(() => {
    if (initialValues) {
      setHokh(initialValues.hokh);
      setTenkh(initialValues.tenkh);
      setEmail(initialValues.email);
      setSoDienThoai(initialValues.soDienThoai);
      setSoCccd(initialValues.soCccd);
      setDiaChi(initialValues.diaChi || ''); // Khởi tạo địa chỉ
    }
  }, [initialValues?.hokh, initialValues?.tenkh, initialValues?.email, initialValues?.soDienThoai, initialValues?.soCccd, initialValues?.diaChi]); // Chỉ phụ thuộc vào các giá trị cụ thể

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
    diaChi: '', // Tùy chọn: không bắt buộc, có thể thêm validation nếu cần
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
      diaChi,
    });

    setShowSaveSuccess(true);

    if (onSave) {
      onSave({ hokh, tenkh, email, soDienThoai, soCccd, diaChi });
    }
    setTimeout(() => {
    setShowSaveSuccess(false);
  }, 3000); // 3000ms = 3 giây
  };

  const handleCloseSuccessModal = () => {
    setShowSaveSuccess(false);
  };

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoHeader}>
        <h3>{t('profile.personalInfo')}</h3>
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
<div className={styles.formGroup}>
  <label>{t('profile.addressLabel')}</label>
  <input
    type="text"
    value={diaChi}
    onChange={(e) => setDiaChi(e.target.value)}
    placeholder={t('profile.addressPlaceholder')}
  />
  {errors.diaChi && <p className={styles.error}>{errors.diaChi}</p>}
</div>
      <div className={styles.formActions}>
        <button className={styles.saveInfoBtn} onClick={handleSaveInfo}>
          {t('profile.saveChanges')}
        </button>
        {onCancel && (
          <button className={styles.cancelBtn} onClick={onCancel}>
            {t('profile.cancel')}
          </button>
        )}
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