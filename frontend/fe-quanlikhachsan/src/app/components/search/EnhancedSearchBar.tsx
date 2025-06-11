'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import styles from './EnhancedSearchBar.module.css';

interface EnhancedSearchBarProps {
  variant?: 'hero' | 'page' | 'compact';
  showAdvancedFilters?: boolean;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  variant = 'hero',
  showAdvancedFilters = false
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy ngày hiện tại và ngày mai
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDateForDisplay = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formatDateForInput = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Khởi tạo state với giá trị từ URL hoặc giá trị mặc định
  const [location, setLocation] = useState<string>(
    searchParams?.get('location') || 'Chọn tỉnh thành'
  );
  const [checkInDate, setCheckInDate] = useState<string>(
    searchParams?.get('checkIn') || formatDateForDisplay(today)
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    searchParams?.get('checkOut') || formatDateForDisplay(tomorrow)
  );
  const [guests, setGuests] = useState<string>(
    searchParams?.get('guests') || '2 khách'
  );
  
  // Format dates for input fields
  const [checkInInput, setCheckInInput] = useState<string>(formatDateForInput(today));
  const [checkOutInput, setCheckOutInput] = useState<string>(formatDateForInput(tomorrow));

  // Cập nhật input dates khi checkInDate/checkOutDate thay đổi
  useEffect(() => {
    if (checkInDate && checkInDate.includes('/')) {
      const [day, month, year] = checkInDate.split('/');
      setCheckInInput(`${year}-${month}-${day}`);
    }
    
    if (checkOutDate && checkOutDate.includes('/')) {
      const [day, month, year] = checkOutDate.split('/');
      setCheckOutInput(`${year}-${month}-${day}`);
    }
  }, [checkInDate, checkOutDate]);

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    setCheckInInput(inputDate);
    
    if (inputDate) {
      const [year, month, day] = inputDate.split('-');
      setCheckInDate(`${day}/${month}/${year}`);
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    setCheckOutInput(inputDate);
    
    if (inputDate) {
      const [year, month, day] = inputDate.split('-');
      setCheckOutDate(`${day}/${month}/${year}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo URL params
    const params = new URLSearchParams();
    if (location && location !== 'Chọn tỉnh thành') params.set('location', location);
    if (checkInDate) params.set('checkIn', checkInDate);
    if (checkOutDate) params.set('checkOut', checkOutDate);
    if (guests) params.set('guests', guests);
    
    // Chuyển hướng đến trang rooms với params
    router.push(`/users/rooms?${params.toString()}`);
  };

  return (
    <div className={`${styles.searchContainer} ${styles[variant]}`}>
      <form onSubmit={handleSearch} className={styles.searchRow}>
        <div className={styles.searchField}>
          <i className="fas fa-map-marker-alt"></i>
          <select 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Chọn tỉnh thành">Chọn tỉnh thành</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Phú Quốc">Phú Quốc</option>
          </select>
        </div>
        
        <div className={styles.searchField}>
          <i className="fas fa-calendar-alt"></i>
          <span className={styles.dateLabel}>Nhận phòng</span>
          <input 
            type="date" 
            value={checkInInput}
            onChange={handleCheckInChange}
            min={formatDateForInput(today)}
          />
        </div>
        
        <div className={styles.searchField}>
          <i className="fas fa-calendar-alt"></i>
          <span className={styles.dateLabel}>Trả phòng</span>
          <input 
            type="date" 
            value={checkOutInput}
            onChange={handleCheckOutChange}
            min={checkInInput || formatDateForInput(today)}
          />
        </div>
        
        <div className={styles.searchField}>
          <i className="fas fa-user-friends"></i>
          <select 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          >
            <option value="1 khách">1 khách</option>
            <option value="2 khách">2 khách</option>
            <option value="3 khách">3 khách</option>
            <option value="4 khách">4 khách</option>
            <option value="5+ khách">5+ khách</option>
          </select>
        </div>
        
        <button type="submit" className={styles.searchButton}>
          <i className="fas fa-search"></i>
          Tìm kiếm
        </button>
      </form>
    </div>
  );
};

export default EnhancedSearchBar;
