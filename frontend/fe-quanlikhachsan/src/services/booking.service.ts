import { api } from '../config/api';
import { DatPhong, ChiTietDatPhong } from '../types';

export const bookingService = {
    // Đặt phòng
    getDatPhongs: async (): Promise<DatPhong[]> => {
        const response = await api.get<DatPhong[]>('/datphong');
        return response.data;
    },

    getDatPhongById: async (id: number): Promise<DatPhong> => {
        const response = await api.get<DatPhong>(`/datphong/${id}`);
        return response.data;
    },

    createDatPhong: async (data: {
        khachHangId: number;
        ngayNhanPhong: Date;
        ngayTraPhong: Date;
        chiTietDatPhongs: {
            phongId: number;
            giaPhong: number;
        }[];
    }): Promise<DatPhong> => {
        const response = await api.post<DatPhong>('/datphong', data);
        return response.data;
    },

    updateDatPhong: async (id: number, data: Partial<DatPhong>): Promise<DatPhong> => {
        const response = await api.put<DatPhong>(`/datphong/${id}`, data);
        return response.data;
    },

    deleteDatPhong: async (id: number): Promise<void> => {
        await api.delete(`/datphong/${id}`);
    },

    // Chi tiết đặt phòng
    getChiTietDatPhongs: async (datPhongId: number): Promise<ChiTietDatPhong[]> => {
        const response = await api.get<ChiTietDatPhong[]>(`/chitietdatphong/${datPhongId}`);
        return response.data;
    },

    createChiTietDatPhong: async (data: Partial<ChiTietDatPhong>): Promise<ChiTietDatPhong> => {
        const response = await api.post<ChiTietDatPhong>('/chitietdatphong', data);
        return response.data;
    },

    updateChiTietDatPhong: async (id: number, data: Partial<ChiTietDatPhong>): Promise<ChiTietDatPhong> => {
        const response = await api.put<ChiTietDatPhong>(`/chitietdatphong/${id}`, data);
        return response.data;
    },

    deleteChiTietDatPhong: async (id: number): Promise<void> => {
        await api.delete(`/chitietdatphong/${id}`);
    },

    // Tìm kiếm đặt phòng
    searchDatPhongs: async (params: {
        khachHangId?: number;
        ngayBatDau?: Date;
        ngayKetThuc?: Date;
        trangThai?: string;
    }): Promise<DatPhong[]> => {
        const response = await api.get<DatPhong[]>('/datphong/search', { params });
        return response.data;
    }
}; 