'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';
import { API_BASE_URL } from '@/lib/config';
import { getFormDataHeaders } from '@/lib/api';
import { supabaseConfig } from '@/config/supabase';
import { useAuth } from '@/lib/auth';

interface AvatarUploadModalProps {
  onClose: () => void;
  onAvatarSelected: (src: string) => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ onClose, onAvatarSelected }) => {
  const { updateUser } = useAuth();
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
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn cần đăng nhập để upload avatar');
        return;
      }

      // Decode token để lấy thông tin người dùng
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Lấy thông tin từ token
      const userId = payload.nameid;
      const email = payload.email;
      const name = payload.name;
      
      console.log('Token payload:', payload);
      console.log('User ID from token:', userId);
      console.log('Email from token:', email);
      console.log('Name from token:', name);

      if (!userId) {
        alert('Không thể xác định ID người dùng từ token');
        return;
      }

      // Tạo FormData để gửi file trực tiếp đến backend
      const formData = new FormData();
      formData.append('AvatarFile', selectedFile);
      
      // Thay đổi cách tiếp cận: Tạo một endpoint mới để upload avatar
      const updateResponse = await fetch(`${API_BASE_URL}/KhachHang/upload-avatar-by-id/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (updateResponse.ok) {
        // Lấy URL avatar từ response
        const responseData = await updateResponse.json();
        const avatarUrl = responseData.avatarUrl;

        // Cập nhật thông tin user trong context (cả hai field để tương thích)
        updateUser({
          avatarUrl,
          anhDaiDien: avatarUrl
        });

        // Gọi callback để cập nhật UI
        onAvatarSelected(avatarUrl);

        console.log('Avatar đã được lưu vào database:', avatarUrl);
        alert('Upload avatar thành công!');
        onClose();
      } else {
        const errorText = await updateResponse.text();
        console.error('Error response:', errorText);
        alert(`Lỗi khi cập nhật avatar: ${errorText}`);
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
        <h3>Chọn ảnh đại diện</h3>

        <div className={styles.inputGroup}>
          <label>Chọn ảnh từ máy tính:</label>
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
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;