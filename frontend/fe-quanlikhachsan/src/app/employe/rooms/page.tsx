"use client";
import React, { useState, useEffect } from "react";
import { getEmployeeRooms, updateRoomStatus } from '../../../lib/api';

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
  tang: number;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách phòng từ API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getEmployeeRooms();
        setRooms(data);
        setError(null);
      } catch (err: any) {
        console.error("Lỗi khi lấy danh sách phòng:", err);
        setError(err.message || "Không thể lấy danh sách phòng");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Cập nhật trạng thái phòng
  const handleStatusChange = async (id: string, status: string) => {
    try {
      setLoading(true);
      await updateRoomStatus(id, status);
      
      // Cập nhật trạng thái trong state
      setRooms(rooms.map(r => r.id === id ? { ...r, status } : r));
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi cập nhật trạng thái phòng:", err);
      setError(err.message || "Không thể cập nhật trạng thái phòng");
    } finally {
      setLoading(false);
    }
  };

  if (loading && rooms.length === 0) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải dữ liệu phòng...</div>;
  }

  if (error && rooms.length === 0) {
    return <div style={{padding:'24px', color:'red', textAlign:'center'}}>Lỗi: {error}</div>;
  }

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35', marginBottom:18}}>Quản lý phòng</h2>
      {error && <div style={{color:'red', marginBottom:'16px'}}>Lỗi: {error}</div>}
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>ID</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Tên phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Loại</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Giá (VNĐ)</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Tầng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Trạng thái</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{room.id}</td>
                <td style={{padding:'12px 10px'}}>{room.name}</td>
                <td style={{padding:'12px 10px'}}>{room.type}</td>
                <td>{room.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</td>
                <td style={{padding:'12px 10px'}}>{room.tang}</td>
                <td style={{padding:'12px 10px'}}>
                  <span style={{
                    background: statusColors[room.status] || "#e5e7eb", 
                    color: statusTextColors[room.status] || "#374151", 
                    fontWeight:600, 
                    borderRadius:6, 
                    padding:'4px 10px'
                  }}>
                    {room.status}
                  </span>
                </td>
                <td style={{padding:'12px 10px'}}>
                  <select
                    value={room.status}
                    onChange={e => handleStatusChange(room.id, e.target.value)}
                    style={{padding:'7px 12px', borderRadius:6, border:'1.5px solid #e5e7eb', fontWeight:500, fontSize:'1rem', background:'#f7fafc'}}
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