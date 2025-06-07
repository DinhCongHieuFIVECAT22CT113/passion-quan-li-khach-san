'use client';

import React from 'react';
import styles from './LoadingStates.module.css';

// Skeleton Loader for Room Cards
export function RoomCardSkeleton() {
  return (
    <div className={styles.roomCardSkeleton}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonFooter}>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader for Room Grid
export function RoomGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.roomGrid}>
      {Array.from({ length: count }, (_, index) => (
        <RoomCardSkeleton key={index} />
      ))}
    </div>
  );
}

// General Loading Spinner
export function LoadingSpinner({ size = 'medium', message }: { 
  size?: 'small' | 'medium' | 'large';
  message?: string;
}) {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}></div>
      </div>
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
}

// Page Loading Overlay
export function PageLoadingOverlay({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className={styles.pageOverlay}>
      <div className={styles.overlayContent}>
        <LoadingSpinner size="large" />
        <p className={styles.overlayMessage}>{message}</p>
      </div>
    </div>
  );
}

// Button Loading State
export function LoadingButton({ 
  children, 
  isLoading, 
  disabled,
  onClick,
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  isLoading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      className={`${styles.loadingButton} ${className} ${isLoading ? styles.loading : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <div className={styles.buttonSpinner}></div>}
      <span className={isLoading ? styles.hiddenText : ''}>{children}</span>
    </button>
  );
}

// Search Results Loading
export function SearchResultsLoading() {
  return (
    <div className={styles.searchResultsLoading}>
      <div className={styles.searchLoadingHeader}>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText}></div>
      </div>
      <RoomGridSkeleton count={4} />
    </div>
  );
}

// Form Loading Overlay
export function FormLoadingOverlay({ message = 'Đang xử lý...' }: { message?: string }) {
  return (
    <div className={styles.formOverlay}>
      <div className={styles.formOverlayContent}>
        <LoadingSpinner size="medium" />
        <p>{message}</p>
      </div>
    </div>
  );
}