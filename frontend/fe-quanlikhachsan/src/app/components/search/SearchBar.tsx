'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaUsers, FaSearch, FaBed } from 'react-icons/fa';
import { useSearch } from './SearchContext';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  variant?: 'hero' | 'compact' | 'sticky';
  onSearch?: (searchData: any) => void;
  showRoomCount?: boolean;
}

export default function SearchBar({ 
  variant = 'hero', 
  onSearch,
  showRoomCount = false 
}: SearchBarProps) {
  const router = useRouter();
  const { searchData, updateSearchData, isSearchActive } = useSearch();
  
  const [localSearchData, setLocalSearchData] = useState(searchData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with context
  useEffect(() => {
    setLocalSearchData(searchData);
  }, [searchData]);

  // Set default dates
  useEffect(() => {
    if (!localSearchData.checkInDate || !localSearchData.checkOutDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const defaultData = {
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: tomorrow.toISOString().split('T')[0],
        guests: 2,
        rooms: 1,
      };
      
      setLocalSearchData(prev => ({ ...prev, ...defaultData }));
    }
  }, [localSearchData.checkInDate, localSearchData.checkOutDate]);

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  // Calculate nights
  const calculateNights = () => {
    if (!localSearchData.checkInDate || !localSearchData.checkOutDate) return 0;
    const checkIn = new Date(localSearchData.checkInDate);
    const checkOut = new Date(localSearchData.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setLocalSearchData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localSearchData.checkInDate) {
      newErrors.checkInDate = 'Vui lòng chọn ngày nhận phòng';
    }

    if (!localSearchData.checkOutDate) {
      newErrors.checkOutDate = 'Vui lòng chọn ngày trả phòng';
    }

    if (localSearchData.checkInDate && localSearchData.checkOutDate) {
      const checkIn = new Date(localSearchData.checkInDate);
      const checkOut = new Date(localSearchData.checkOutDate);
      
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Ngày trả phòng phải sau ngày nhận phòng';
      }

      // Check if check-in date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkIn < today) {
        newErrors.checkInDate = 'Ngày nhận phòng không thể là ngày trong quá khứ';
      }
    }

    if (localSearchData.guests < 1) {
      newErrors.guests = 'Số khách phải ít nhất là 1';
    }

    if (showRoomCount && localSearchData.rooms < 1) {
      newErrors.rooms = 'Số phòng phải ít nhất là 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Update context
    updateSearchData(localSearchData);

    // Call custom onSearch if provided
    if (onSearch) {
      onSearch(localSearchData);
      return;
    }

    // Default behavior: navigate to rooms page
    const searchParams = new URLSearchParams({
      checkIn: localSearchData.checkInDate,
      checkOut: localSearchData.checkOutDate,
      guests: localSearchData.guests.toString(),
      ...(showRoomCount && { rooms: localSearchData.rooms.toString() }),
    });
    
    router.push(`/users/rooms?${searchParams.toString()}`);
  };



  const nights = calculateNights();

  return (
    <form onSubmit={handleSearch} className={`${styles.searchForm} ${styles[variant]}`}>
      <div className={styles.searchGrid}>
        {/* Check-in Date */}
        <div className={styles.searchField}>
          <label htmlFor="checkInDate">
            <FaCalendarAlt className={styles.searchIcon} />
            Ngày nhận phòng
          </label>
          <div className={styles.dateInputWrapper}>
            <input
              type="date"
              id="checkInDate"
              value={localSearchData.checkInDate}
              onChange={(e) => handleInputChange('checkInDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.checkInDate ? styles.error : ''}
            />
            <div className={styles.dateDisplay}>
              {mounted && localSearchData.checkInDate && formatDateDisplay(localSearchData.checkInDate)}
            </div>
          </div>
          {errors.checkInDate && (
            <span className={styles.errorMessage}>{errors.checkInDate}</span>
          )}
        </div>
        
        {/* Check-out Date */}
        <div className={styles.searchField}>
          <label htmlFor="checkOutDate">
            <FaCalendarAlt className={styles.searchIcon} />
            Ngày trả phòng
          </label>
          <div className={styles.dateInputWrapper}>
            <input
              type="date"
              id="checkOutDate"
              value={localSearchData.checkOutDate}
              onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
              min={localSearchData.checkInDate || new Date().toISOString().split('T')[0]}
              className={errors.checkOutDate ? styles.error : ''}
            />
            <div className={styles.dateDisplay}>
              {mounted && localSearchData.checkOutDate && formatDateDisplay(localSearchData.checkOutDate)}
              {/* Đã xóa phần hiển thị số đêm ở đây */}
            </div>
          </div>
          {errors.checkOutDate && (
            <span className={styles.errorMessage}>{errors.checkOutDate}</span>
          )}
          {/* Xóa phần hiển thị số đêm ở đây */}
        </div>
        
        {/* Guests */}
        <div className={styles.searchField}>
          <label htmlFor="guests" className={styles.darkText}>
            <FaUsers className={styles.searchIcon} />
            Số khách
          </label>
          <select
            id="guests"
            value={localSearchData.guests}
            onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
            className={`${errors.guests ? styles.error : ''} ${styles.darkText}`}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num} className={styles.darkText}>{num} khách</option>
            ))}
          </select>
          {errors.guests && (
            <span className={styles.errorMessage}>{errors.guests}</span>
          )}
        </div>

        {/* Rooms (optional) */}
        {showRoomCount && (
          <div className={styles.searchField}>
            <label htmlFor="rooms" className={styles.darkText}>
              <FaBed className={styles.searchIcon} />
              Số phòng
            </label>
            <select
              id="rooms"
              value={localSearchData.rooms}
              onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
              className={`${errors.rooms ? styles.error : ''} ${styles.darkText}`}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num} className={styles.darkText}>{num} phòng</option>
              ))}
            </select>
            {errors.rooms && (
              <span className={styles.errorMessage}>{errors.rooms}</span>
            )}
          </div>
        )}
        
        {/* Search Button */}
        <button type="submit" className={styles.searchButton}>
          <FaSearch className={styles.searchIcon} />
          {variant === 'compact' ? 'Tìm' : 'Tìm phòng'}
        </button>
      </div>

      {/* Search Summary (for compact variant) */}
      {variant === 'compact' && isSearchActive && (
        <div className={styles.searchSummary}>
          <span>
            {localSearchData.checkInDate} - {localSearchData.checkOutDate} • 
            {localSearchData.guests} khách
            {showRoomCount && ` • ${localSearchData.rooms} phòng`}
            {nights > 0 && ` • ${nights} đêm`}
          </span>
        </div>
      )}
    </form>
  );
}
