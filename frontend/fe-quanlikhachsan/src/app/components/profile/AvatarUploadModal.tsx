'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';

interface AvatarUploadModalProps {
  onClose: () => void;
  onAvatarSelected: (src: string) => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ onClose, onAvatarSelected }) => {
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
        <h3>Chọn ảnh đại diện</h3>

        <div className={styles.inputGroup}>
          <label>Dán link ảnh:</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <button onClick={handleUseLink}>
            Dùng ảnh từ link
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label>Hoặc tải ảnh từ máy:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button className={styles.modalCancelBtn} onClick={onClose}>
          Huỷ
        </button>
      </div>
    </div>
  );
};

export default AvatarUploadModal;