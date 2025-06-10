'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import styles from './SearchBar.module.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);
  
  // Danh sách các địa điểm phổ biến
  const popularLocations = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Phú Quốc', 'Hội An'
  ];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current && 
        !locationRef.current.contains(event.target as Node) &&
        guestsRef.current && 
        !guestsRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    console.log('Searching with:', { location, checkIn, checkOut, guests });
    // Thực hiện tìm kiếm
  };

  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchBar}>
        {/* Địa điểm */}
        <div 
          ref={locationRef}
          className={`${styles.inputGroup} ${activeDropdown === 'location' ? styles.active : ''}`} 
          onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
        >
          <FaMapMarkerAlt className={styles.inputIcon} />
          <div className={styles.inputContent}>
            <span className={styles.inputLabel}>Địa điểm</span>
            <input
              type="text"
              placeholder="Chọn tỉnh thành"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={styles.inputField}
            />
          </div>
          
          {activeDropdown === 'location' && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>Địa điểm phổ biến</div>
              <div className={styles.dropdownContent}>
                {popularLocations.map((loc) => (
                  <div 
                    key={loc} 
                    className={styles.dropdownItem}
                    onClick={() => {
                      setLocation(loc);
                      setActiveDropdown(null);
                    }}
                  >
                    <FaMapMarkerAlt className={styles.dropdownItemIcon} /> 
                    <span>{loc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ngày check-in */}
        <div className={styles.inputGroup}>
          <FaCalendarAlt className={styles.inputIcon} />
          <div className={styles.inputContent}>
            <span className={styles.inputLabel}>Nhận phòng</span>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              placeholderText="Chọn ngày"
              className={styles.dateInput}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

        {/* Ngày check-out */}
        <div className={styles.inputGroup}>
          <FaCalendarAlt className={styles.inputIcon} />
          <div className={styles.inputContent}>
            <span className={styles.inputLabel}>Trả phòng</span>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || new Date()}
              placeholderText="Chọn ngày"
              className={styles.dateInput}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

        {/* Số lượng khách */}
        <div 
          ref={guestsRef}
          className={`${styles.inputGroup} ${activeDropdown === 'guests' ? styles.active : ''}`}
          onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
        >
          <FaUserFriends className={styles.inputIcon} />
          <div className={styles.inputContent}>
            <span className={styles.inputLabel}>Khách</span>
            <div className={styles.guestDisplay}>{guests} khách</div>
          </div>
          
          {activeDropdown === 'guests' && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>Số lượng khách</div>
              <div className={styles.guestSelector}>
                <span>Người lớn</span>
                <div className={styles.guestControls}>
                  <button 
                    className={styles.guestButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (guests > 1) setGuests(guests - 1);
                    }}
                    disabled={guests <= 1}
                  >-</button>
                  <span className={styles.guestCount}>{guests}</span>
                  <button 
                    className={styles.guestButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGuests(guests + 1);
                    }}
                  >+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nút tìm kiếm */}
        <button className={styles.searchButton} onClick={handleSearch}>
          <FaSearch className={styles.searchIcon} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

