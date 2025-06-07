'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SearchData {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  searchTimestamp?: string;
}

interface SearchContextType {
  searchData: SearchData;
  updateSearchData: (data: Partial<SearchData>) => void;
  clearSearchData: () => void;
  isSearchActive: boolean;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
}

const defaultSearchData: SearchData = {
  checkInDate: '',
  checkOutDate: '',
  guests: 2,
  rooms: 1,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchData, setSearchData] = useState<SearchData>(defaultSearchData);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Load search data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearch = localStorage.getItem('roomSearchData');
      if (savedSearch) {
        try {
          const parsed = JSON.parse(savedSearch);
          setSearchData(parsed);
          setIsSearchActive(true);
        } catch (error) {
          console.error('Error parsing saved search data:', error);
        }
      }
    }
  }, []);

  // Save search data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isSearchActive) {
      localStorage.setItem('roomSearchData', JSON.stringify({
        ...searchData,
        searchTimestamp: new Date().toISOString(),
      }));
    }
  }, [searchData, isSearchActive]);

  const updateSearchData = (data: Partial<SearchData>) => {
    setSearchData(prev => ({ ...prev, ...data }));
    setIsSearchActive(true);
  };

  const clearSearchData = () => {
    setSearchData(defaultSearchData);
    setIsSearchActive(false);
    setSearchResults([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('roomSearchData');
    }
  };

  return (
    <SearchContext.Provider value={{
      searchData,
      updateSearchData,
      clearSearchData,
      isSearchActive,
      searchResults,
      setSearchResults,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}