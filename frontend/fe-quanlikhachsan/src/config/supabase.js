import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Supabase configuration for frontend
export const supabaseConfig = {
  url: 'https://ttumqjufzmvfkccnyxfx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dW1xanVmem12ZmtjY255eGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNzI0NDcsImV4cCI6MjA2NDk0ODQ0N30.5yE_qHw-RP_eRoFdevkKgFw_trSJhpv2hwBinoGvcow',
  bucketName: 'hotel-images'
};

// Helper function to get public URL for images
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full Supabase URL, return as is
  if (imagePath.includes('supabase.co')) {
    return imagePath;
  }
  
  // If it's a full HTTP URL (old system), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local path (old system), convert to backend URL
  if (imagePath.startsWith('/') || imagePath.includes('UpLoad/')) {
    // Remove leading slash and UpLoad/ prefix if present
    const cleanPath = imagePath.replace(/^\//, '').replace(/^UpLoad\//, '');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://passion-quan-li-khach-san.onrender.com/api';
    return `${backendUrl.replace('/api', '')}/api/images/${cleanPath}`;
  }
  
  // If it's a Supabase path (new system), construct the public URL
  return `${supabaseConfig.url}/storage/v1/object/public/${supabaseConfig.bucketName}/${imagePath}`;
};

// Helper function to extract file path from Supabase URL
export const extractFilePathFromUrl = (url) => {
  if (!url || !url.includes('supabase.co')) return url;
  
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const bucketIndex = pathSegments.findIndex(segment => segment === supabaseConfig.bucketName);
    
    if (bucketIndex >= 0 && bucketIndex < pathSegments.length - 1) {
      return pathSegments.slice(bucketIndex + 1).join('/');
    }
    
    return url;
  } catch (error) {
    console.error('Error extracting file path:', error);
    return url;
  }
};

// Unified function to get valid image source (replaces all getValidImageSrc functions)
export const getValidImageSrc = (imagePath) => {
  if (!imagePath) return '/images/no-image.png';
  
  // If already a full Supabase URL, return as is
  if (imagePath.includes('supabase.co')) {
    return imagePath;
  }
  
  // If it's a full HTTP URL (old system or external), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local path (old system), convert to backend URL
  if (imagePath.startsWith('/') || imagePath.includes('UpLoad/')) {
    // Remove leading slash and UpLoad/ prefix if present
    const cleanPath = imagePath.replace(/^\//, '').replace(/^UpLoad\//, '');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://passion-quan-li-khach-san.onrender.com/api';
    return `${backendUrl.replace('/api', '')}/api/images/${cleanPath}`;
  }
  
  // If it's a relative path, assume it's a local asset
  if (!imagePath.startsWith('/')) {
    return `/images/${imagePath}`;
  }
  
  // If it's a Supabase path (new system), construct the public URL
  return `${supabaseConfig.url}/storage/v1/object/public/${supabaseConfig.bucketName}/${imagePath}`;
};

// Component wrapper for Image with error handling
export const SafeImage = ({ src, alt, fallbackSrc = '/images/no-image.png', ...props }) => {
  const [imgSrc, setImgSrc] = useState(getValidImageSrc(src));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  useEffect(() => {
    setImgSrc(getValidImageSrc(src));
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
};