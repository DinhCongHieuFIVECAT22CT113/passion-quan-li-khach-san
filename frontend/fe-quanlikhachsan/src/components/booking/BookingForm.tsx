import React, { useState, useEffect } from 'react';
import { useRooms } from '../../hooks/useRooms';
import { useBookings } from '../../hooks/useBookings';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface BookingFormProps {
    khachHangId: number;
    onSuccess?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ khachHangId, onSuccess }) => {
    const { rooms, roomTypes, loading: roomsLoading, getRooms, getRoomTypes, searchAvailableRooms } = useRooms();
    const { createBooking, loading: bookingLoading } = useBookings();

    const [ngayNhanPhong, setNgayNhanPhong] = useState<Date>(new Date());
    const [ngayTraPhong, setNgayTraPhong] = useState<Date>(new Date());
    const [selectedRooms, setSelectedRooms] = useState<{ phongId: number; giaPhong: number }[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getRooms();
        getRoomTypes();
    }, []);

    useEffect(() => {
        if (ngayNhanPhong && ngayTraPhong) {
            searchAvailableRooms({
                ngayNhanPhong,
                ngayTraPhong
            });
        }
    }, [ngayNhanPhong, ngayTraPhong]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedRooms.length === 0) {
                setError('Vui lòng chọn ít nhất một phòng');
                return;
            }

            await createBooking({
                khachHangId,
                ngayNhanPhong,
                ngayTraPhong,
                chiTietDatPhongs: selectedRooms
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Đặt phòng thất bại');
        }
    };

    const handleRoomSelect = (phongId: number, giaPhong: number) => {
        setSelectedRooms(prev => {
            const exists = prev.find(room => room.phongId === phongId);
            if (exists) {
                return prev.filter(room => room.phongId !== phongId);
            }
            return [...prev, { phongId, giaPhong }];
        });
    };

    if (roomsLoading) {
        return <div>Đang tải...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Ngày nhận phòng
                </label>
                <DatePicker
                    selected={ngayNhanPhong}
                    onChange={date => setNgayNhanPhong(date as Date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    minDate={new Date()}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Ngày trả phòng
                </label>
                <DatePicker
                    selected={ngayTraPhong}
                    onChange={date => setNgayTraPhong(date as Date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    minDate={ngayNhanPhong}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Chọn phòng
                </label>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rooms.map(room => (
                        <div
                            key={room.id}
                            className={`relative rounded-lg border p-4 cursor-pointer ${
                                selectedRooms.find(r => r.phongId === room.id)
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-300'
                            }`}
                            onClick={() => handleRoomSelect(room.id, room.loaiPhong.giaPhong)}
                        >
                            <h3 className="text-lg font-medium">{room.maPhong}</h3>
                            <p className="text-sm text-gray-500">
                                {room.loaiPhong.tenLoaiPhong}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                                {room.loaiPhong.giaPhong.toLocaleString('vi-VN')} VNĐ/đêm
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={bookingLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {bookingLoading ? 'Đang xử lý...' : 'Đặt phòng'}
                </button>
            </div>
        </form>
    );
}; 