'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/lib/config';
import { getFormDataHeaders } from '@/lib/api';

interface AvatarUploadModalProps {
  onClose: () => void;
  onAvatarSelected: (src: string) => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ onClose, onAvatarSelected }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file avatar');
      return;
    }

    setIsUploading(true);
    try {
      // Lấy username từ localStorage hoặc context
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn cần đăng nhập để upload avatar');
        return;
      }

      // Decode token để lấy username (hoặc có thể lấy từ user context)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const username = payload.username;

      console.log('Token payload:', payload);
      console.log('Username from token:', username);

      if (!username) {
        alert('Không thể xác định username từ token');
        return;
      }

      const formData = new FormData();
      formData.append('AvatarFile', selectedFile);

      const headers = await getFormDataHeaders();
      const uploadUrl = `${API_BASE_URL}/KhachHang/${username}/upload-avatar`;
      console.log('Upload URL:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: headers,
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        onAvatarSelected(result.avatarUrl);
        alert('Upload avatar thành công!');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Lỗi upload: ${errorData.message || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Có lỗi xảy ra khi upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3>{t('profile.uploadAvatar')}</h3>

        <div className={styles.inputGroup}>
          <label>{t('profile.uploadFile')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          {previewUrl && (
            <div className={styles.previewContainer}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }}
              />
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className={styles.uploadBtn}
          >
            {isUploading ? 'Đang upload...' : 'Upload Avatar'}
          </button>
          
          <button 
            className={styles.modalCancelBtn} 
            onClick={onClose}
            disabled={isUploading}
          >
            {t('profile.cancelUpload')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;