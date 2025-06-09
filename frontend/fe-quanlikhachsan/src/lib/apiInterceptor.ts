"use client";

import { ensureValidToken } from './tokenManager';

// Wrapper cho fetch với auto-refresh token
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Đảm bảo token hợp lệ trước khi gọi API
  const token = await ensureValidToken();
  
  // Tạo headers mới với token
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Thêm default headers
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  // Nếu không phải FormData và không có Content-Type, thêm application/json
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };
  
  try {
    const response = await fetch(url, finalOptions);
    
    // Nếu nhận được 401, thử refresh token một lần nữa
    if (response.status === 401) {
      console.log('Nhận được 401, thử refresh token...');
      
      const newToken = await ensureValidToken();
      if (newToken && newToken !== token) {
        // Token đã được refresh, thử lại request
        headers.set('Authorization', `Bearer ${newToken}`);
        const retryOptions: RequestInit = {
          ...options,
          headers,
          credentials: 'include',
        };
        
        return await fetch(url, retryOptions);
      }
    }
    
    return response;
  } catch (error) {
    console.error('Lỗi trong fetchWithAuth:', error);
    throw error;
  }
};

// Helper function để tạo headers với auto-refresh (đơn giản hóa)
export const createAuthHeaders = async (additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> => {
  const token = await ensureValidToken();
  
  return {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...additionalHeaders,
  };
};

// Helper function cho FormData headers
export const createFormDataHeaders = async (additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> => {
  const token = await ensureValidToken();
  
  return {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...additionalHeaders,
  };
};