'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';

interface PersonalInfoFormProps {
  onSave?: (data: { hokh: string; tenkh: string }) => void;
  onChangePassword?: () => void;
  onPaymentOptions?: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ onSave, onChangePassword, onPaymentOptions }) => {
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
      hokh: hokh.trim() === '' ? 'Họ không được để trống.' : '',
      tenkh: tenkh.trim() === '' ? 'Tên không được để trống.' : '',
      email:
        email.trim() === ''
          ? 'Email không được để trống.'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? 'Email không đúng định dạng.'
          : '',
      soDienThoai: soDienThoai.trim() === '' ? 'Số điện thoại không được để trống.' : !/^\d+$/.test(soDienThoai) ? 'Số điện thoại không hợp lệ.' : '',
      soCccd:
        soCccd.trim() === ''
          ? 'Số CCCD/CMND không được để trống.'
          : !/^\d{12}$/.test(soCccd)
          ? 'Số CCCD/CMND phải có đúng 12 chữ số.'
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
        <h3>Thông tin cá nhân</h3>
        <button className={styles.actionBtn} onClick={onChangePassword}>
          Đổi mật khẩu
        </button>
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>Họ</label>
            <input
              type="text"
              value={hokh}
              onChange={(e) => setHokh(e.target.value)}
              placeholder="Nhập họ của bạn"
            />
            {errors.hokh && <p className={styles.error}>{errors.hokh}</p>}
          </div>
        </div>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>Tên</label>
            <input
              type="text"
              value={tenkh}
              onChange={(e) => setTenkh(e.target.value)}
              placeholder="Nhập tên của bạn"
            />
            {errors.tenkh && <p className={styles.error}>{errors.tenkh}</p>}
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ví dụ: yourname@example.com"
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>Số CCCD/CMND</label>
            <input
              type="text"
              value={soCccd}
              onChange={(e) => setSoCccd(e.target.value)}
              placeholder="12 chữ số"
              maxLength={12}
            />
            {errors.soCccd && <p className={styles.error}>{errors.soCccd}</p>}
          </div>
        </div>
        <div className={styles.halfWidth}>
          <div className={styles.formGroup}>
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
            {errors.soDienThoai && <p className={styles.error}>{errors.soDienThoai}</p>}
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button className={styles.saveInfoBtn} onClick={handleSaveInfo}>
          Lưu thay đổi
        </button>
        <button className={styles.actionBtn} onClick={onPaymentOptions}>
          Tùy chọn Thanh Toán
        </button>
      </div>

      {showSaveSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Đã lưu thay đổi!</h3>
            <button className={styles.modalOkBtn} onClick={handleCloseSuccessModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoForm;