"use client";

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { tokenManager } from '../lib/tokenManager';

interface DecodedToken {
  exp: number;
  nameid: string;
  role: string;
  name: string;
  [key: string]: any;
}

export default function TokenStatus() {
  const [tokenInfo, setTokenInfo] = useState<{
    isValid: boolean;
    expiresAt: string;
    timeUntilExpiry: string;
    isExpiringSoon: boolean;
    userInfo: any;
  } | null>(null);

  const [refreshTokenInfo, setRefreshTokenInfo] = useState<{
    exists: boolean;
    length: number;
  } | null>(null);

  const updateTokenInfo = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    // Update refresh token info
    setRefreshTokenInfo({
      exists: !!refreshToken,
      length: refreshToken?.length || 0
    });

    if (!token) {
      setTokenInfo(null);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      const isValid = !tokenManager.isTokenExpired(token);
      const isExpiringSoon = tokenManager.isTokenExpiringSoon(token);

      setTokenInfo({
        isValid,
        expiresAt: new Date(decoded.exp * 1000).toLocaleString('vi-VN'),
        timeUntilExpiry: timeUntilExpiry > 0 
          ? `${Math.floor(timeUntilExpiry / 60)} phút ${Math.floor(timeUntilExpiry % 60)} giây`
          : 'Đã hết hạn',
        isExpiringSoon,
        userInfo: {
          id: decoded.nameid,
          name: decoded.name,
          role: decoded.role
        }
      });
    } catch (error) {
      console.error('Error decoding token:', error);
      setTokenInfo(null);
    }
  };

  const handleManualRefresh = async () => {
    try {
      const result = await tokenManager.refreshTokenIfNeeded();
      if (result) {
        console.log('Token refreshed successfully:', result);
        updateTokenInfo();
      } else {
        console.log('No refresh needed or failed');
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  const handleClearTokens = () => {
    tokenManager.clearTokens();
    updateTokenInfo();
  };

  useEffect(() => {
    updateTokenInfo();
    
    // Update every second
    const interval = setInterval(updateTokenInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!tokenInfo) {
    return (
      <div style={{ 
        padding: '16px', 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        margin: '16px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>🔐 Token Status</h3>
        <p style={{ color: 'red' }}>❌ Không có token</p>
        <p><strong>Refresh Token:</strong> {refreshTokenInfo?.exists ? '✅ Có' : '❌ Không'}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '16px',
      backgroundColor: tokenInfo.isValid ? '#f0f8ff' : '#ffe4e1'
    }}>
      <h3>🔐 Token Status</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <p><strong>Trạng thái:</strong> 
          <span style={{ color: tokenInfo.isValid ? 'green' : 'red' }}>
            {tokenInfo.isValid ? ' ✅ Hợp lệ' : ' ❌ Hết hạn'}
          </span>
        </p>
        
        <p><strong>Hết hạn lúc:</strong> {tokenInfo.expiresAt}</p>
        
        <p><strong>Thời gian còn lại:</strong> 
          <span style={{ color: tokenInfo.isExpiringSoon ? 'orange' : 'green' }}>
            {tokenInfo.timeUntilExpiry}
            {tokenInfo.isExpiringSoon && ' ⚠️ Sắp hết hạn (< 2 phút)'}
          </span>
        </p>
        
        <p><strong>User:</strong> {tokenInfo.userInfo.name} ({tokenInfo.userInfo.role})</p>
        
        <p><strong>Refresh Token:</strong> {refreshTokenInfo?.exists ? '✅ Có' : '❌ Không'}</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleManualRefresh}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Token
        </button>
        
        <button 
          onClick={handleClearTokens}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Tokens
        </button>
        
        <button 
          onClick={updateTokenInfo}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Info
        </button>
      </div>
    </div>
  );
}