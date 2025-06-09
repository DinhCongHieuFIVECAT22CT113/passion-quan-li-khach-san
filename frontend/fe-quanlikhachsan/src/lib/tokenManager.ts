"use client";

import { jwtDecode } from 'jwt-decode';
import { refreshToken } from './api';
import { UserDto } from '../types/auth';

interface DecodedToken {
  exp: number;
  nameid: string;
  role: string;
  [key: string]: any;
}

class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<UserDto> | null = null;

  // Kiểm tra token có hết hạn không
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Lấy thời gian hết hạn của token (tính bằng giây)
  getTokenExpiration(token: string): number | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp;
    } catch {
      return null;
    }
  }

  // Kiểm tra token có sắp hết hạn không (còn ít hơn 2 phút)
  isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      return timeUntilExpiry < 120; // Còn ít hơn 2 phút (120 giây)
    } catch {
      return true;
    }
  }

  // Lấy thông tin user từ token
  getUserInfoFromToken(token: string): { userId: string; userType: string } | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const userType = decoded.role === 'R04' ? 'KhachHang' : 'NhanVien';
      return {
        userId: decoded.nameid,
        userType: userType
      };
    } catch {
      return null;
    }
  }

  // Refresh token và cập nhật localStorage
  async refreshTokenIfNeeded(): Promise<UserDto | null> {
    const token = localStorage.getItem('token');
    const refreshTokenValue = localStorage.getItem('refreshToken');

    if (!token || !refreshTokenValue) {
      return null;
    }

    // Nếu token chưa hết hạn và chưa sắp hết hạn, không cần refresh
    if (!this.isTokenExpired(token) && !this.isTokenExpiringSoon(token)) {
      return null;
    }

    // Nếu đang refresh, trả về promise hiện tại
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const userInfo = this.getUserInfoFromToken(token);
    if (!userInfo) {
      this.clearTokens();
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh(refreshTokenValue, userInfo.userId, userInfo.userType);

    try {
      const result = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return result;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.clearTokens();
      throw error;
    }
  }

  // Thực hiện refresh token
  private async performRefresh(refreshTokenValue: string, userId: string, userType: string): Promise<UserDto> {
    try {
      const result = await refreshToken({
        refreshToken: refreshTokenValue,
        userId: userId,
        userType: userType
      });

      // Cập nhật tokens mới vào localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('userId', result.maNguoiDung);
      localStorage.setItem('userName', result.userName);

      console.log('Token đã được refresh thành công');
      console.log(`Thời gian hết hạn mới: ${new Date(this.getTokenExpiration(result.token)! * 1000).toLocaleString('vi-VN')}`);
      
      // Thiết lập timer cho lần refresh tiếp theo
      this.scheduleNextRefresh(result.token);

      return result;
    } catch (error) {
      console.error('Lỗi khi refresh token:', error);
      throw error;
    }
  }

  // Lên lịch refresh token tiếp theo
  scheduleNextRefresh(token: string): void {
    this.clearRefreshTimer();

    const expiration = this.getTokenExpiration(token);
    if (!expiration) return;

    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = expiration - currentTime;
    
    // Refresh khi còn 2 phút trước khi hết hạn
    const refreshTime = Math.max(0, (timeUntilExpiry - 120) * 1000);

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshTokenIfNeeded();
      } catch (error) {
        console.error('Auto refresh failed:', error);
        // Có thể dispatch event để thông báo cho UI
        window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
      }
    }, refreshTime);

    console.log(`🔄 Đã lên lịch refresh token sau ${Math.round(refreshTime / 1000)} giây (${Math.round(refreshTime / 60000)} phút)`);
    console.log(`⏰ Token sẽ được refresh lúc: ${new Date(Date.now() + refreshTime).toLocaleString('vi-VN')}`);
  }

  // Xóa timer refresh
  clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Xóa tất cả tokens
  clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('staffInfo');
    this.clearRefreshTimer();
  }

  // Khởi tạo auto-refresh khi có token
  initializeAutoRefresh(): void {
    const token = localStorage.getItem('token');
    if (token && !this.isTokenExpired(token)) {
      this.scheduleNextRefresh(token);
    }
  }

  // Dừng auto-refresh
  stopAutoRefresh(): void {
    this.clearRefreshTimer();
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();

// Helper function để sử dụng trong API calls
export const ensureValidToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  if (tokenManager.isTokenExpired(token)) {
    try {
      const refreshResult = await tokenManager.refreshTokenIfNeeded();
      return refreshResult ? refreshResult.token : null;
    } catch {
      return null;
    }
  }

  if (tokenManager.isTokenExpiringSoon(token)) {
    // Refresh trong background, không chờ
    tokenManager.refreshTokenIfNeeded().catch(console.error);
  }

  return token;
};