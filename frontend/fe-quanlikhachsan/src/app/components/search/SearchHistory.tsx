'use client';

import React, { useState, useEffect } from 'react';
import { FaClock, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaTimes, FaHistory } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import styles from './SearchHistory.module.css';

interface SearchHistoryItem {
  id: string;
  query: string;
  location?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  timestamp: string;
  frequency: number;
}

interface SearchHistoryProps {
  onSelectHistory: (item: SearchHistoryItem) => void;
  onClearHistory?: () => void;
  maxItems?: number;
  showFrequent?: boolean;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  onSelectHistory,
  onClearHistory,
  maxItems = 10,
  showFrequent = true
}) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [frequentSearches, setFrequentSearches] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      const savedFrequent = localStorage.getItem('frequentSearches');
      
      if (savedHistory) {
        const historyData = JSON.parse(savedHistory);
        setHistory(historyData.slice(0, maxItems));
      }
      
      if (savedFrequent && showFrequent) {
        const frequentData = JSON.parse(savedFrequent);
        setFrequentSearches(frequentData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    setHistory([]);
    setFrequentSearches([]);
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('frequentSearches');
    
    if (onClearHistory) {
      onClearHistory();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const searchTime = new Date(timestamp);
    const diffMs = now.getTime() - searchTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      return 'Vừa xong';
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return searchTime.toLocaleDateString('vi-VN');
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (history.length === 0 && frequentSearches.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FaHistory className={styles.emptyIcon} />
        <p>Chưa có lịch sử tìm kiếm</p>
        <span>Các tìm kiếm gần đây sẽ xuất hiện ở đây</span>
      </div>
    );
  }

  return (
    <div className={styles.searchHistory}>
      {/* Frequent Searches */}
      {showFrequent && frequentSearches.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Tìm kiếm thường xuyên</h4>
          </div>
          <div className={styles.frequentGrid}>
            {frequentSearches.map((item) => (
              <button
                key={`frequent-${item.id}`}
                className={styles.frequentItem}
                onClick={() => onSelectHistory(item)}
              >
                <div className={styles.frequentContent}>
                  <div className={styles.frequentQuery}>
                    {item.query || item.location || 'Tìm kiếm'}
                  </div>
                  <div className={styles.frequentDetails}>
                    <span>{item.guests} khách</span>
                    <span>•</span>
                    <span>{calculateNights(item.checkIn, item.checkOut)} đêm</span>
                  </div>
                </div>
                <div className={styles.frequentBadge}>
                  {item.frequency}x
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {history.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Tìm kiếm gần đây</h4>
            <button
              onClick={clearAllHistory}
              className={styles.clearButton}
            >
              Xóa tất cả
            </button>
          </div>
          
          <div className={styles.historyList}>
            {history.map((item) => (
              <div
                key={item.id}
                className={styles.historyItem}
                onClick={() => onSelectHistory(item)}
              >
                <div className={styles.historyIcon}>
                  <FaClock />
                </div>
                
                <div className={styles.historyContent}>
                  <div className={styles.historyMain}>
                    <div className={styles.historyQuery}>
                      {item.query || item.location || 'Tìm kiếm phòng'}
                    </div>
                    <div className={styles.historyTime}>
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </div>
                  
                  <div className={styles.historyDetails}>
                    <div className={styles.historyDetail}>
                      <FaCalendarAlt className={styles.detailIcon} />
                      <span>
                        {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
                      </span>
                    </div>
                    
                    <div className={styles.historyDetail}>
                      <FaUsers className={styles.detailIcon} />
                      <span>{item.guests} khách</span>
                    </div>
                    
                    <div className={styles.historyDetail}>
                      <span className={styles.nightsCount}>
                        {calculateNights(item.checkIn, item.checkOut)} đêm
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  className={styles.removeButton}
                  onClick={(e) => removeHistoryItem(item.id, e)}
                  title="Xóa khỏi lịch sử"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistory;