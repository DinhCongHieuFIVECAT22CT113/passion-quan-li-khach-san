'use client';

import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius
      }}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton height="200px" borderRadius="8px" className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <Skeleton height="24px" width="80%" className={styles.skeletonTitle} />
        <Skeleton height="16px" width="100%" className={styles.skeletonText} />
        <Skeleton height="16px" width="60%" className={styles.skeletonText} />
        <div className={styles.skeletonFooter}>
          <Skeleton height="20px" width="100px" />
          <Skeleton height="32px" width="80px" borderRadius="16px" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonPromotionGrid: React.FC = () => {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export const SkeletonTestimonial: React.FC = () => {
  return (
    <div className={styles.skeletonTestimonial}>
      <div className={styles.skeletonTestimonialHeader}>
        <Skeleton width="60px" height="60px" borderRadius="50%" />
        <div className={styles.skeletonTestimonialInfo}>
          <Skeleton height="20px" width="120px" />
          <Skeleton height="16px" width="80px" />
        </div>
      </div>
      <Skeleton height="16px" width="100%" className={styles.skeletonText} />
      <Skeleton height="16px" width="90%" className={styles.skeletonText} />
      <Skeleton height="16px" width="70%" className={styles.skeletonText} />
    </div>
  );
};

export const SkeletonTestimonialGrid: React.FC = () => {
  return (
    <div className={styles.skeletonTestimonialGrid}>
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonTestimonial key={index} />
      ))}
    </div>
  );
};