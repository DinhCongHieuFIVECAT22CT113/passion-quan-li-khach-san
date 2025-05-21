'use client';
import React, { useState, useEffect } from "react";
import styles from "./RoomManager.module.css";
import { getRooms, getRoomTypes, createRoom, updateRoom, deleteRoom } from "../../../lib/api";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders } from '@/lib/api';

interface Room {
  roomId: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName?: string;
  price?: number;
  status: string;
  thumbnail?: string;
  image?: string;
  floor?: number;
  createdDate?: string;
  updatedDate?: string;
}

interface RoomType {
  roomTypeId: string;
  roomTypeName: string;
  description: string;
  thumbnail?: string;
}

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<Room>({ 
    roomId: "", 
    roomNumber: "", 
    roomTypeId: "", 
    price: 0,
    status: "",
    floor: 1 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách phòng và loại phòng từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Lấy danh sách phòng
        const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        // Lấy danh sách loại phòng
        const roomTypesResponse = await fetch(`${API_BASE_URL}/LoaiPhong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        // Kết hợp thông tin loại phòng vào danh sách phòng và đảm bảo giaTien luôn là số
        const roomsData = await roomsResponse.json();
        const roomTypesData = await roomTypesResponse.json();
        
        const roomsWithTypes = roomsData.map((room: Room) => {
          const roomType = roomTypesData.find((type: RoomType) => type.roomTypeId === room.roomTypeId);
          return {
            ...room,
            price: room.price || 0, // Đảm bảo price không null hoặc undefined
            roomTypeName: roomType?.roomTypeName || "Không xác định"
          };
        });
        
        setRooms(roomsWithTypes);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mở modal Thêm mới
  const openAddModal = () => {
    setForm({ roomId: "", roomNumber: "", roomTypeId: "", price: 0, status: "", floor: 1 });
    setEditingRoom(null);
    setShowModal(true);
  };

  // Mở modal Sửa
  const openEditModal = (room: Room) => {
    setForm(room);
    setEditingRoom(room);
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setForm({ roomId: "", roomNumber: "", roomTypeId: "", price: 0, status: "", floor: 1 });
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'price' ? Number(value) : value });
  };

  // Xác nhận xóa phòng
  const handleDelete = async (roomId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
        
        const response = await fetch(`${API_BASE_URL}/Phong/${roomId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          // Cập nhật danh sách phòng sau khi xóa
          setRooms(rooms.filter(room => room.roomId !== roomId));
          alert('Xóa phòng thành công');
        } else {
          throw new Error("Có lỗi xảy ra khi xóa phòng");
        }
      } catch (err) {
        const error = err as Error;
        alert(`Lỗi: ${error.message}`);
        console.error("Error deleting room:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Xử lý submit Thêm/Sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      // Chuẩn bị dữ liệu gửi đi
      const normalizedForm: Omit<Room, 'roomTypeName'> = {
        ...form,
        price: Number(form.price) || 0
      };
      
      // Thêm ngày tạo/sửa theo đúng yêu cầu backend
      if (editingRoom) {
        normalizedForm.updatedDate = new Date().toISOString(); // Cập nhật ngày sửa khi edit
      } else {
        normalizedForm.createdDate = new Date().toISOString(); // Thêm ngày tạo khi thêm mới
      }
      
      console.log("Dữ liệu phòng:", normalizedForm);
      
      let response;
      
      if (editingRoom) {
        // Cập nhật phòng
        response = await fetch(`${API_BASE_URL}/Phong/${form.roomId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(normalizedForm),
          credentials: 'include',
        });
      } else {
        // Tạo phòng mới
        response = await fetch(`${API_BASE_URL}/Phong`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(normalizedForm),
          credentials: 'include',
        });
      }
      
      if (response.ok) {
        // Lấy lại danh sách phòng để có dữ liệu mới nhất
        // Sử dụng hàm fetchRooms thay cho fetchData
        const fetchRooms = async () => {
          try {
            // Lấy danh sách phòng
            const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
              method: 'GET',
              headers: getAuthHeaders('GET'),
              credentials: 'include'
            });
            
            // Lấy danh sách loại phòng
            const roomTypesResponse = await fetch(`${API_BASE_URL}/LoaiPhong`, {
              method: 'GET',
              headers: getAuthHeaders('GET'),
              credentials: 'include'
            });
            
            // Kết hợp thông tin loại phòng vào danh sách phòng và đảm bảo giaTien luôn là số
            const roomsData = await roomsResponse.json();
            const roomTypesData = await roomTypesResponse.json();
            
            const roomsWithTypes = roomsData.map((room: Room) => {
              const roomType = roomTypesData.find((type: RoomType) => type.roomTypeId === room.roomTypeId);
              return {
                ...room,
                price: room.price || 0, // Đảm bảo price không null hoặc undefined
                roomTypeName: roomType?.roomTypeName || "Không xác định"
              };
            });
            
            setRooms(roomsWithTypes);
          } catch (err) {
            const error = err as Error;
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
            console.error("Error fetching data:", error);
          }
        };

        fetchRooms();
        
        // Reset form
        setForm({ 
          roomId: "", 
          roomNumber: "", 
          roomTypeId: "", 
          price: 0,
          status: "",
          floor: 0
        });
        setEditingRoom(null);
        closeModal();
        alert(editingRoom ? 'Cập nhật phòng thành công' : 'Thêm phòng thành công');
      } else {
        throw new Error("Có lỗi xảy ra khi lưu phòng");
      }
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error saving room:", error);
    }
  };

  // Hàm render trạng thái với màu sắc
  const renderStatus = (status: string) => {
    if (status === 'Empty') return <span className={`${styles.status} ${styles['status-empty']}`}>Trống</span>;
    if (status === 'Booked') return <span className={`${styles.status} ${styles['status-booked']}`}>Đã đặt</span>;
    if (status === 'Cleaning') return <span className={`${styles.status} ${styles['status-cleaning']}`}>Đang dọn</span>;
    return <span className={styles.status}>{status}</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý phòng</h2>
        <button className={styles.addBtn} onClick={openAddModal}>+ Thêm phòng</button>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
                <th>Mã phòng</th>
              <th>Số phòng</th>
                <th>Loại phòng</th>
              <th>Giá (VNĐ)</th>
              <th>Tầng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
                <tr key={room.roomId}>
                  <td>{room.roomId}</td>
                  <td>{room.roomNumber}</td>
                  <td>{room.roomTypeName}</td>
                  <td>{(room.price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</td>
                  <td>{room.floor || "-"}</td>
                  <td>{renderStatus(room.status)}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => openEditModal(room)}>Sửa</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(room.roomId)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingRoom ? 'Sửa phòng' : 'Thêm phòng'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Số phòng:</label>
                <input 
                  name="roomNumber" 
                  value={form.roomNumber} 
                  onChange={handleChange} 
                  placeholder="Số phòng" 
                  required 
                />
              </div>
              <div>
                <label>Loại phòng:</label>
                <select 
                  name="roomTypeId" 
                  value={form.roomTypeId} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Chọn loại phòng</option>
                  {roomTypes.map(type => (
                    <option key={type.roomTypeId} value={type.roomTypeId}>
                      {type.roomTypeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Giá (VNĐ):</label>
                <input 
                  name="price" 
                  type="number" 
                  value={form.price} 
                  onChange={handleChange} 
                  placeholder="Giá phòng" 
                  required 
                  min={0} 
                />
              </div>
              <div>
                <label>Trạng thái:</label>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="Trống">Trống</option>
                  <option value="Đã đặt">Đã đặt</option>
                  <option value="Đang dọn">Đang dọn</option>
                </select>
              </div>
              <div>
                <label>Tầng:</label>
                <input
                  name="floor"
                  type="number"
                  value={form.floor}
                  onChange={handleChange}
                  placeholder="Tầng"
                  min={1}
                  required
                />
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.addBtn}>{editingRoom ? 'Lưu' : 'Thêm'}</button>
                <button type="button" onClick={closeModal} className={styles.deleteBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 