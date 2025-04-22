'use client';
import React, { useState } from 'react';
import './cus_account.css'; 

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
    <div className="modal-backdrop">
      <div className="modal">
        <h3 className="text-lg font-bold mb-4">Chọn ảnh đại diện</h3>

        <div className="input-group mb-4">
          <label className="block mb-1">Dán link ảnh:</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full p-2 border rounded"
          />
          <button
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            onClick={handleUseLink}
          >
            Dùng ảnh từ link
          </button>
        </div>

        <div className="input-group mb-4">
          <label className="block mb-1">Hoặc tải ảnh từ máy:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        <button
          className="mt-4 bg-gray-300 px-4 py-2 rounded"
          onClick={onClose}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
};

export default AvatarUploadModal;
