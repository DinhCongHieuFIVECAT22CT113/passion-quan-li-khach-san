"use client";
import React, { useState } from "react";

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  status: "Trống" | "Đang ở" | "Cần dọn";
}

const initialRooms: Room[] = [
  { id: 1, name: "101", type: "Deluxe", price: 1200000, status: "Trống" },
  { id: 2, name: "102", type: "Standard", price: 900000, status: "Đang ở" },
  { id: 3, name: "201", type: "Suite", price: 2000000, status: "Cần dọn" },
];

const statusColors: Record<string, string> = {
  "Trống": "#d1fae5",
  "Đang ở": "#fee2e2",
  "Cần dọn": "#fef9c3"
};
const statusTextColors: Record<string, string> = {
  "Trống": "#047857",
  "Đang ở": "#b91c1c",
  "Cần dọn": "#b45309"
};

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const handleStatusChange = (id: number, status: Room["status"]) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35', marginBottom:18}}>Quản lý phòng</h2>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>ID</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Tên phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Loại</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Giá (VNĐ)</th>
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
                <td style={{padding:'12px 10px'}}>
                  <span style={{background:statusColors[room.status], color:statusTextColors[room.status], fontWeight:600, borderRadius:6, padding:'4px 10px'}}>{room.status}</span>
                </td>
                <td style={{padding:'12px 10px'}}>
                  <select
                    value={room.status}
                    onChange={e => handleStatusChange(room.id, e.target.value as Room["status"])}
                    style={{padding:'7px 12px', borderRadius:6, border:'1.5px solid #e5e7eb', fontWeight:500, fontSize:'1rem', background:'#f7fafc'}}
                  >
                    <option value="Trống">Trống</option>
                    <option value="Đang ở">Đang ở</option>
                    <option value="Cần dọn">Cần dọn</option>
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