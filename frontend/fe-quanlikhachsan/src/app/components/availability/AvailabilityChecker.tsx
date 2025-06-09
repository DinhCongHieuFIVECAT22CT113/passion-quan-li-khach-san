'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import styles from './AvailabilityChecker.module.css';

interface AvailabilityStatus {
  available: boolean;
  roomsLeft: number;
  price: number;
  lastChecked: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
}

interface AvailabilityCheckerProps {
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  onAvailabilityChange?: (status: AvailabilityStatus) => void;
  autoCheck?: boolean;
  showDetails?: boolean;
}

const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({
  roomTypeId,
  checkInDate,
  checkOutDate,
  guests,
  onAvailabilityChange,
  autoCheck = true,
  showDetails = true
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AvailabilityStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Mock availability check - In real app, this would call your API
  const checkAvailability = useCallback(async (): Promise<AvailabilityStatus> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock logic for availability
    const random = Math.random();
    const roomsLeft = Math.floor(Math.random() * 10) + 1;
    const basePrice = 1500000 + Math.floor(Math.random() * 2000000);
    
    let available = true;
    let urgency: 'low' | 'medium' | 'high' = 'low';
    let message = '';

    if (random < 0.1) {
      // 10% chance of no availability
      available = false;
      message = 'Không còn phòng trống cho ngày này';
    } else if (roomsLeft <= 2) {
      urgency = 'high';
      message = `Chỉ còn ${roomsLeft} phòng cuối cùng!`;
    } else if (roomsLeft <= 5) {
      urgency = 'medium';
      message = `Còn ${roomsLeft} phòng trống`;
    } else {
      urgency = 'low';
      message = `${roomsLeft} phòng có sẵn`;
    }

    // Price adjustment based on availability
    const adjustedPrice = available 
      ? basePrice * (urgency === 'high' ? 1.2 : urgency === 'medium' ? 1.1 : 1)
      : basePrice;

    return {
      available,
      roomsLeft: available ? roomsLeft : 0,
      price: Math.round(adjustedPrice),
      lastChecked: new Date().toISOString(),
      message,
      urgency
    };
  }, [roomTypeId, checkInDate, checkOutDate, guests]);

  // Perform availability check
  const performCheck = useCallback(async () => {
    if (!roomTypeId || !checkInDate || !checkOutDate) return;

    setIsChecking(true);
    try {
      const newStatus = await checkAvailability();
      setStatus(newStatus);
      setLastCheckTime(new Date());
      
      if (onAvailabilityChange) {
        onAvailabilityChange(newStatus);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setStatus({
        available: false,
        roomsLeft: 0,
        price: 0,
        lastChecked: new Date().toISOString(),
        message: 'Không thể kiểm tra tình trạng phòng',
        urgency: 'low'
      });
    } finally {
      setIsChecking(false);
    }
  }, [checkAvailability, onAvailabilityChange, roomTypeId, checkInDate, checkOutDate]);

  // Auto-check on mount and when dependencies change
  useEffect(() => {
    if (autoCheck) {
      performCheck();
    }
  }, [autoCheck, performCheck]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoCheck) return;

    const interval = setInterval(() => {
      performCheck();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoCheck, performCheck]);

  const formatLastChecked = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) {
      return 'vừa xong';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <FaClock className={styles.iconChecking} />;
    }
    
    if (!status) {
      return <FaClock className={styles.iconPending} />;
    }

    if (!status.available) {
      return <FaTimes className={styles.iconUnavailable} />;
    }

    if (status.urgency === 'high') {
      return <FaExclamationTriangle className={styles.iconUrgent} />;
    }

    return <FaCheck className={styles.iconAvailable} />;
  };

  const getStatusClass = () => {
    if (isChecking) return styles.checking;
    if (!status) return styles.pending;
    if (!status.available) return styles.unavailable;
    return styles[status.urgency];
  };

  if (!showDetails && !status) {
    return null;
  }

  return (
    <div className={`${styles.availabilityChecker} ${getStatusClass()}`}>
      <div className={styles.statusHeader}>
        <div className={styles.statusIcon}>
          {getStatusIcon()}
        </div>
        <div className={styles.statusContent}>
          <div className={styles.statusMessage}>
            {isChecking ? 'Đang kiểm tra...' : status?.message || 'Chưa kiểm tra'}
          </div>
          {status && status.available && (
            <div className={styles.priceInfo}>
              <span className={styles.price}>
                {status.price.toLocaleString('vi-VN')} VNĐ
              </span>
              <span className={styles.priceUnit}>/đêm</span>
            </div>
          )}
        </div>
        <button
          onClick={performCheck}
          disabled={isChecking}
          className={styles.refreshButton}
          title="Kiểm tra lại"
        >
          <FaClock className={isChecking ? styles.spinning : ''} />
        </button>
      </div>

      {showDetails && status && (
        <div className={styles.statusDetails}>
          {status.available && (
            <div className={styles.availabilityDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Phòng trống:</span>
                <span className={styles.detailValue}>{status.roomsLeft}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cho {guests} khách</span>
              </div>
            </div>
          )}
          
          {lastCheckTime && (
            <div className={styles.lastChecked}>
              Cập nhật {formatLastChecked(lastCheckTime)}
            </div>
          )}
        </div>
      )}

      {status && status.urgency === 'high' && status.available && (
        <div className={styles.urgencyBanner}>
          <FaExclamationTriangle />
          <span>Đặt ngay để không bỏ lỡ!</span>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;