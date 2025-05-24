'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';
import { useTranslation } from 'react-i18next';

interface AvatarUploadModalProps {
  onClose: () => void;
  onAvatarSelected: (src: string) => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ onClose, onAvatarSelected }) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState('');

  const handleUseLink = () => {
    if (imageUrl.trim()) {
      onAvatarSelected(imageUrl.trim());
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      onAvatarSelected(localUrl);
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3>{t('profile.uploadAvatar')}</h3>

        <div className={styles.inputGroup}>
          <label>{t('profile.imageLink')}</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <button onClick={handleUseLink}>
            {t('profile.useLink')}
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label>{t('profile.uploadFile')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button className={styles.modalCancelBtn} onClick={onClose}>
          {t('profile.cancelUpload')}
        </button>
      </div>
    </div>
  );
};

export default AvatarUploadModal;