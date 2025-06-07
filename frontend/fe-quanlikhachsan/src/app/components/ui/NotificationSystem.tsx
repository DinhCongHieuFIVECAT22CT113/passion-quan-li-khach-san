'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import styles from './NotificationSystem.module.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const removeNotificationRef = useRef<(id: string) => void>(() => {});

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  removeNotificationRef.current = removeNotification;

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotificationRef.current?.(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', title, message, ...options });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: 8000, // Longer duration for errors
      ...options 
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', title, message, ...options });
  }, [addNotification]);

  const info = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', title, message, ...options });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
      success,
      error,
      warning,
      info,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Notification Container Component
function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.notificationContainer}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Individual Notification Item
function NotificationItem({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void; 
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationTriangle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <div className={`${styles.notification} ${styles[notification.type]}`}>
      <div className={styles.notificationIcon}>
        {getIcon()}
      </div>
      
      <div className={styles.notificationContent}>
        <h4 className={styles.notificationTitle}>{notification.title}</h4>
        {notification.message && (
          <p className={styles.notificationMessage}>{notification.message}</p>
        )}
        
        {notification.action && (
          <button 
            className={styles.notificationAction}
            onClick={notification.action.onClick}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      
      <button 
        className={styles.notificationClose}
        onClick={onClose}
        aria-label="Đóng thông báo"
      >
        <FaTimes />
      </button>
    </div>
  );
}

// Hook for common notification patterns
export function useCommonNotifications() {
  const { success, error, warning, info } = useNotification();

  return {
    // Booking related
    bookingSuccess: () => success(
      'Đặt phòng thành công!',
      'Chúng tôi đã gửi email xác nhận đến bạn.'
    ),
    bookingError: (message?: string) => error(
      'Đặt phòng thất bại',
      message || 'Vui lòng thử lại sau.'
    ),
    
    // Profile related
    profileUpdated: () => success('Cập nhật thông tin thành công'),
    passwordChanged: () => success('Đổi mật khẩu thành công'),
    
    // Network related
    networkError: () => error(
      'Lỗi kết nối',
      'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.',
      { persistent: true }
    ),
    
    // Form validation
    validationError: (message: string) => warning('Lỗi nhập liệu', message),
    
    // General
    saveSuccess: () => success('Lưu thành công'),
    deleteSuccess: () => success('Xóa thành công'),
    copySuccess: () => info('Đã sao chép vào clipboard'),
  };
}