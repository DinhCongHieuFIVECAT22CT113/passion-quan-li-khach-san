import { useState } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/auth.service';
import { LoginRequest, User } from '../types';

export const useAuth = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (data: LoginRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(data);
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            setUser(response.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng xuất thất bại');
        }
    };

    const getProfile = async () => {
        try {
            setLoading(true);
            const user = await authService.getProfile();
            setUser(user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lấy thông tin người dùng thất bại');
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        login,
        logout,
        getProfile
    };
}; 