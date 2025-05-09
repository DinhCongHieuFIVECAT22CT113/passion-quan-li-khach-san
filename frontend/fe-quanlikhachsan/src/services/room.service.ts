import { api } from '../config/api';
import { Phong, LoaiPhong } from '../types';

export const roomService = {
    // Loại phòng
    getLoaiPhongs: async (): Promise<LoaiPhong[]> => {
        const response = await api.get<LoaiPhong[]>('/loaiphong');
        return response.data;
    },

    getLoaiPhongById: async (id: number): Promise<LoaiPhong> => {
        const response = await api.get<LoaiPhong>(`/loaiphong/${id}`);
        return response.data;
    },

    createLoaiPhong: async (data: Partial<LoaiPhong>): Promise<LoaiPhong> => {
        const response = await api.post<LoaiPhong>('/loaiphong', data);
        return response.data;
    },

    updateLoaiPhong: async (id: number, data: Partial<LoaiPhong>): Promise<LoaiPhong> => {
        const response = await api.put<LoaiPhong>(`/loaiphong/${id}`, data);
        return response.data;
    },

    deleteLoaiPhong: async (id: number): Promise<void> => {
        await api.delete(`/loaiphong/${id}`);
    },

    // Phòng
    getPhongs: async (): Promise<Phong[]> => {
        const response = await api.get<Phong[]>('/phong');
        return response.data;
    },

    getPhongById: async (id: number): Promise<Phong> => {
        const response = await api.get<Phong>(`/phong/${id}`);
        return response.data;
    },

    createPhong: async (data: Partial<Phong>): Promise<Phong> => {
        const response = await api.post<Phong>('/phong', data);
        return response.data;
    },

    updatePhong: async (id: number, data: Partial<Phong>): Promise<Phong> => {
        const response = await api.put<Phong>(`/phong/${id}`, data);
        return response.data;
    },

    deletePhong: async (id: number): Promise<void> => {
        await api.delete(`/phong/${id}`);
    },

    // Tìm kiếm phòng trống
    searchAvailableRooms: async (params: {
        ngayNhanPhong: Date;
        ngayTraPhong: Date;
        loaiPhongId?: number;
    }): Promise<Phong[]> => {
        const response = await api.get<Phong[]>('/phong/search', { params });
        return response.data;
    }
}; 