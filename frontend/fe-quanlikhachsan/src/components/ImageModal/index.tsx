'use client';

import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, alt }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt={alt}
            fill
            style={{ objectFit: 'contain' }}
            quality={100}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 