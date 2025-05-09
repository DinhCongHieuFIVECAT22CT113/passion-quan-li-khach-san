import { useState } from 'react';
import { roomService } from '../services/room.service';
import { Phong, LoaiPhong } from '../types';

export const useRooms = () => {
    const [rooms, setRooms] = useState<Phong[]>([]);
    const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getRooms = async () => {
        try {
            setLoading(true);
            const data = await roomService.getPhongs();
            setRooms(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lấy danh sách phòng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const getRoomTypes = async () => {
        try {
            setLoading(true);
            const data = await roomService.getLoaiPhongs();
            setRoomTypes(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lấy danh sách loại phòng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const createRoom = async (data: Partial<Phong>) => {
        try {
            setLoading(true);
            const newRoom = await roomService.createPhong(data);
            setRooms([...rooms, newRoom]);
            return newRoom;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Tạo phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateRoom = async (id: number, data: Partial<Phong>) => {
        try {
            setLoading(true);
            const updatedRoom = await roomService.updatePhong(id, data);
            setRooms(rooms.map(room => room.id === id ? updatedRoom : room));
            return updatedRoom;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Cập nhật phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteRoom = async (id: number) => {
        try {
            setLoading(true);
            await roomService.deletePhong(id);
            setRooms(rooms.filter(room => room.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Xóa phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchAvailableRooms = async (params: {
        ngayNhanPhong: Date;
        ngayTraPhong: Date;
        loaiPhongId?: number;
    }) => {
        try {
            setLoading(true);
            const data = await roomService.searchAvailableRooms(params);
            setRooms(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Tìm kiếm phòng thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        rooms,
        roomTypes,
        loading,
        error,
        getRooms,
        getRoomTypes,
        createRoom,
        updateRoom,
        deleteRoom,
        searchAvailableRooms
    };
}; 