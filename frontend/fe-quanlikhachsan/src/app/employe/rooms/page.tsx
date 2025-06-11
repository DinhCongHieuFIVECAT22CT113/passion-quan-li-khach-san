"use client";
import React, { useState, useEffect } from "react";
import { getEmployeeRooms, updateRoomStatus, getRoomTypes } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';
import styles from './RoomManager.module.css';

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
  tang: number;
}

interface RoomType {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  giaMoiDem: number;
  giaMoiGio: number;
}

const statusColors: Record<string, string> = {
  "Trống": "#d1fae5",
  "Đang ở": "#fee2e2",
  "Đã đặt": "#fef3c7",
  "Đang dọn": "#fef9c3",
  "Bảo trì": "#fecaca"
};

const statusTextColors: Record<string, string> = {
  "Trống": "#047857",
  "Đang ở": "#b91c1c",
  "Đã đặt": "#92400e",
  "Đang dọn": "#b45309",
  "Bảo trì": "#991b1b"
};

// Xác định các trạng thái phòng có thể thay đổi
const statusOptions = ["Trống", "Đang ở", "Đang dọn", "Bảo trì"];

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách phòng và loại phòng từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy cả rooms và room types
        const [roomsData, roomTypesData] = await Promise.all([
          getEmployeeRooms(),
          getRoomTypes()
        ]);

        console.log("Dữ liệu phòng nhận được:", roomsData);
        console.log("Dữ liệu loại phòng nhận được:", roomTypesData);

        // Lấy trạng thái phòng từ localStorage nếu có
        let savedRoomStatuses: Record<string, any> = {};
        if (typeof window !== 'undefined') {
          try {
            const savedData = localStorage.getItem('roomStatuses');
            if (savedData) {
              savedRoomStatuses = JSON.parse(savedData);
            }
          } catch (e) {
            console.error('Lỗi khi parse trạng thái phòng từ localStorage:', e);
          }
        }

        // Kết hợp giá từ room types vào rooms và áp dụng trạng thái đã lưu
        const roomsWithPrices = roomsData.map(room => {
          const roomType = roomTypesData.find(rt => rt.maLoaiPhong === room.type);
          // Áp dụng trạng thái từ localStorage nếu có
          const savedStatus = savedRoomStatuses[room.id];
          return {
            ...room,
            price: roomType ? roomType.giaMoiDem : 0,
            status: savedStatus || room.status // Ưu tiên trạng thái đã lưu
          };
        });

        setRooms(roomsWithPrices);
        setRoomTypes(roomTypesData);
        setError(null);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError(error.message || "Không thể lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cập nhật trạng thái phòng
  const handleStatusChange = async (id: string, status: string) => {
    try {
      setLoading(true);
      await updateRoomStatus(id, status);

      // Cập nhật trạng thái trong state
      setRooms(rooms.map(r => r.id === id ? { ...r, status } : r));
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Lỗi khi cập nhật trạng thái phòng:", error);
      setError(error.message || "Không thể cập nhật trạng thái phòng");
    } finally {
      setLoading(false);
    }
  };

  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Trống':
        return `${styles.status} ${styles.statusEmpty}`;
      case 'Đang ở':
        return `${styles.status} ${styles.statusOccupied}`;
      case 'Đã đặt':
        return `${styles.status} ${styles.statusBooked}`;
      case 'Đang dọn':
        return `${styles.status} ${styles.statusCleaning}`;
      case 'Bảo trì':
        return `${styles.status} ${styles.statusMaintenance}`;
      default:
        return styles.status;
    }
  };

  if (loading && rooms.length === 0) {
    return <div className={styles.loading}>Đang tải dữ liệu phòng...</div>;
  }

  if (error && rooms.length === 0) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý phòng</h2>
      </div>
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      <div style={{overflowX:'auto'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên phòng</th>
              <th>Loại</th>
              <th>Giá (VNĐ)</th>
              <th>Tầng</th>
              <th>Trạng thái</th>
              <th>Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td className={styles.roomId}>{room.id}</td>
                <td>{room.name}</td>
                <td className={styles.roomType}>{room.type}</td>
                <td className={styles.price}>{formatCurrency(room.price)}</td>
                <td>{room.tang}</td>
                <td>
                  <span className={getStatusClass(room.status)}>
                    {room.status}
                  </span>
                </td>
                <td>
                  <select
                    value={room.status}
                    onChange={e => handleStatusChange(room.id, e.target.value)}
                    className={styles.select}
                    disabled={loading}
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}