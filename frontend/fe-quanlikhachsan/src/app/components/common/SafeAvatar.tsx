'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { getValidImageSrc } from '../../../config/supabase';

interface SafeAvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
}

const SafeAvatar: React.FC<SafeAvatarProps> = ({ 
  src, 
  alt, 
  size = 40, 
  className = '',
  fallbackSrc = '/images/placeholder-avatar.jpg'
}) => {
  const [imgSrc, setImgSrc] = useState(() => {
    if (!src) return fallbackSrc;
    return getValidImageSrc(src);
  });
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={imgSrc}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={handleError}
        onLoad={handleLoad}
        priority={size > 100} // Priority for larger avatars
      />
    </div>
  );
};

export default SafeAvatar;
