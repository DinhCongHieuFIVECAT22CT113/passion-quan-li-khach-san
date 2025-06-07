'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Log error to monitoring service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/users/home';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <FaExclamationTriangle />
            </div>
            
            <h1 className={styles.errorTitle}>Oops! Có lỗi xảy ra</h1>
            
            <p className={styles.errorMessage}>
              Chúng tôi xin lỗi vì sự bất tiện này. Đã có lỗi không mong muốn xảy ra.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Chi tiết lỗi (Development)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className={styles.errorActions}>
              <button 
                onClick={this.handleRetry}
                className={styles.retryButton}
              >
                <FaRedo />
                Thử lại
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className={styles.homeButton}
              >
                <FaHome />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specific error components
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.specificError}>
      <div className={styles.errorIcon}>
        <FaExclamationTriangle />
      </div>
      <h3>Lỗi kết nối mạng</h3>
      <p>Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.</p>
      <button onClick={onRetry} className={styles.retryButton}>
        <FaRedo />
        Thử lại
      </button>
    </div>
  );
}

export function NotFoundError({ message, onGoBack }: { 
  message?: string; 
  onGoBack?: () => void; 
}) {
  return (
    <div className={styles.specificError}>
      <div className={styles.errorIcon}>
        <FaExclamationTriangle />
      </div>
      <h3>Không tìm thấy</h3>
      <p>{message || 'Trang hoặc nội dung bạn tìm kiếm không tồn tại.'}</p>
      {onGoBack && (
        <button onClick={onGoBack} className={styles.homeButton}>
          Quay lại
        </button>
      )}
    </div>
  );
}

export function ServerError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.specificError}>
      <div className={styles.errorIcon}>
        <FaExclamationTriangle />
      </div>
      <h3>Lỗi server</h3>
      <p>Server đang gặp sự cố. Vui lòng thử lại sau ít phút.</p>
      <button onClick={onRetry} className={styles.retryButton}>
        <FaRedo />
        Thử lại
      </button>
    </div>
  );
}

export default ErrorBoundary;