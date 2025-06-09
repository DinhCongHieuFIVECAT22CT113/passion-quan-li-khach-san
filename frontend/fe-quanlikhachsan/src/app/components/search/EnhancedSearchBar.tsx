'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaClock, FaFilter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from './EnhancedSearchBar.module.css';

interface SearchSuggestion {
  id: string;
  type: 'location' | 'room' | 'recent';
  title: string;
  subtitle?: string;
  icon?: string;
}

interface SearchHistory {
  id: string;
  query: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  timestamp: string;
}

interface EnhancedSearchBarProps {
  variant?: 'hero' | 'header' | 'page';
  showAdvancedFilters?: boolean;
  onSearch?: (searchData: any) => void;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  variant = 'hero',
  showAdvancedFilters = false,
  onSearch
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [roomFeatures, setRoomFeatures] = useState<string[]>([]);

  // Mock data for suggestions
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', type: 'location', title: 'Hà Nội', subtitle: '245 khách sạn', icon: '🏙️' },
    { id: '2', type: 'location', title: 'Hồ Chí Minh', subtitle: '189 khách sạn', icon: '🌆' },
    { id: '3', type: 'location', title: 'Đà Nẵng', subtitle: '156 khách sạn', icon: '🏖️' },
    { id: '4', type: 'room', title: 'Phòng Deluxe', subtitle: 'Phòng cao cấp', icon: '🛏️' },
    { id: '5', type: 'room', title: 'Suite Presidential', subtitle: 'Phòng tổng thống', icon: '👑' },
  ];

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckInDate(today);
    setCheckOutDate(tomorrow);
  }, []);

  // Debounced search suggestions
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 0) {
        const filtered = mockSuggestions.filter(
          suggestion => 
            suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
            suggestion.subtitle?.toLowerCase().includes(query.toLowerCase())
        );
        
        // Add recent searches
        const recentSearches = searchHistory
          .filter(history => history.query.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(history => ({
            id: `recent-${history.id}`,
            type: 'recent' as const,
            title: history.query,
            subtitle: `${history.guests} khách • ${formatDate(history.checkIn)}`,
            icon: '🕒'
          }));

        setSuggestions([...recentSearches, ...filtered]);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [searchHistory]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    
    if (suggestion.type === 'recent') {
      const recentSearch = searchHistory.find(h => h.query === suggestion.title);
      if (recentSearch) {
        setCheckInDate(new Date(recentSearch.checkIn));
        setCheckOutDate(new Date(recentSearch.checkOut));
        setGuests(recentSearch.guests);
      }
    }
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    if (checkOutDate <= checkInDate) {
      alert('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    setIsLoading(true);

    const searchData = {
      query: searchQuery,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      guests,
      priceRange,
      amenities,
      roomFeatures,
      timestamp: new Date().toISOString()
    };

    // Save to search history
    const newHistory: SearchHistory = {
      id: Date.now().toString(),
      query: searchQuery,
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests,
      timestamp: searchData.timestamp
    };

    const updatedHistory = [newHistory, ...searchHistory.slice(0, 9)];
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    // Save search data to localStorage
    localStorage.setItem('roomSearchData', JSON.stringify(searchData));

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(searchData);
    } else {
      // Navigate to rooms page
      const searchParams = new URLSearchParams({
        q: searchQuery,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: guests.toString(),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0].toString() }),
        ...(priceRange[1] < 10000000 && { maxPrice: priceRange[1].toString() }),
        ...(amenities.length > 0 && { amenities: amenities.join(',') }),
        ...(roomFeatures.length > 0 && { features: roomFeatures.join(',') })
      });
      
      router.push(`/users/rooms?${searchParams.toString()}`);
    }

    setTimeout(() => setIsLoading(false), 1000);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const containerClass = `${styles.searchContainer} ${styles[variant]}`;

  return (
    <div className={containerClass}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchFields}>
          {/* Search Input with Autocomplete */}
          <div className={styles.searchField}>
            <FaMapMarkerAlt className={styles.fieldIcon} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('search.destination')}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              className={styles.searchInput}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className={styles.suggestionIcon}>
                      {suggestion.icon}
                    </span>
                    <div className={styles.suggestionContent}>
                      <div className={styles.suggestionTitle}>
                        {suggestion.title}
                      </div>
                      {suggestion.subtitle && (
                        <div className={styles.suggestionSubtitle}>
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    {suggestion.type === 'recent' && (
                      <FaClock className={styles.recentIcon} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Check-in Date */}
          <div className={styles.searchField}>
            <FaCalendarAlt className={styles.fieldIcon} />
            <DatePicker
              selected={checkInDate}
              onChange={(date) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={new Date()}
              placeholderText={t('search.checkIn')}
              className={styles.dateInput}
              dateFormat="dd/MM/yyyy"
              showPopperArrow={false}
            />
          </div>

          {/* Check-out Date */}
          <div className={styles.searchField}>
            <FaCalendarAlt className={styles.fieldIcon} />
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate || new Date()}
              placeholderText={t('search.checkOut')}
              className={styles.dateInput}
              dateFormat="dd/MM/yyyy"
              showPopperArrow={false}
            />
          </div>

          {/* Guests */}
          <div className={styles.searchField}>
            <FaUsers className={styles.fieldIcon} />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={styles.guestSelect}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'khách' : 'khách'}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          {showAdvancedFilters && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
            >
              <FaFilter />
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.searchButton}
          >
            {isLoading ? (
              <div className={styles.spinner} />
            ) : (
              <FaSearch />
            )}
            {variant === 'hero' && (
              <span>{isLoading ? 'Đang tìm...' : t('search.search')}</span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && showAdvancedFilters && (
          <div className={styles.advancedFilters}>
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Khoảng giá (VNĐ)</label>
              <div className={styles.priceRange}>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className={styles.rangeSlider}
                />
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className={styles.rangeSlider}
                />
                <div className={styles.priceDisplay}>
                  {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} VNĐ
                </div>
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Tiện nghi</label>
              <div className={styles.filterOptions}>
                {['WiFi', 'Hồ bơi', 'Gym', 'Spa', 'Nhà hàng', 'Bar'].map(amenity => (
                  <label key={amenity} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, amenity]);
                        } else {
                          setAmenities(amenities.filter(a => a !== amenity));
                        }
                      }}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default EnhancedSearchBar;