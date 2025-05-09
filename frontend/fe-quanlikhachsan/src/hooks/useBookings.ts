import { useState } from 'react';
import { bookingService } from '../services/booking.service';
import { DatPhong, ChiTietDatPhong } from '../types';

export const useBookings = () => {
    const [bookings, setBookings] = useState<DatPhong[]>([]);
    const [bookingDetails, setBookingDetails] = useState<ChiTietDatPhong[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getDatPhongs();
            setBookings(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lấy danh sách đặt phòng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const getBookingById = async (id: number) => {
        try {
            setLoading(true);
            const data = await bookingService.getDatPhongById(id);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lấy thông tin đặt phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createBooking = async (data: {
        khachHangId: number;
        ngayNhanPhong: Date;
        ngayTraPhong: Date;
        chiTietDatPhongs: {
            phongId: number;
            giaPhong: number;
        }[];
    }) => {
        try {
            setLoading(true);
            const newBooking = await bookingService.createDatPhong(data);
            setBookings([...bookings, newBooking]);
            return newBooking;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Tạo đặt phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateBooking = async (id: number, data: Partial<DatPhong>) => {
        try {
            setLoading(true);
            const updatedBooking = await bookingService.updateDatPhong(id, data);
            setBookings(bookings.map(booking => booking.id === id ? updatedBooking : booking));
            return updatedBooking;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Cập nhật đặt phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (id: number) => {
        try {
            setLoading(true);
            await bookingService.deleteDatPhong(id);
            setBookings(bookings.filter(booking => booking.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Xóa đặt phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getBookingDetails = async (bookingId: number) => {
        try {
            setLoading(true);
            const data = await bookingService.getChiTietDatPhongs(bookingId);
            setBookingDetails(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lấy chi tiết đặt phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchBookings = async (params: {
        khachHangId?: number;
        ngayBatDau?: Date;
        ngayKetThuc?: Date;
        trangThai?: string;
    }) => {
        try {
            setLoading(true);
            const data = await bookingService.searchDatPhongs(params);
            setBookings(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Tìm kiếm đặt phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        bookings,
        bookingDetails,
        loading,
        error,
        getBookings,
        getBookingById,
        createBooking,
        updateBooking,
        deleteBooking,
        getBookingDetails,
        searchBookings
    };
}; 