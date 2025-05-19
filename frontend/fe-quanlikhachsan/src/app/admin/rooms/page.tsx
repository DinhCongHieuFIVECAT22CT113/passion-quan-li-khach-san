'use client';
import React, { useState, useEffect } from "react";
import styles from "./RoomManager.module.css";
import { getRooms, getRoomTypes, createRoom, updateRoom, deleteRoom } from "../../../lib/api";
import { API_BASE_URL } from '../../../lib/config';

interface Room {
  maPhong: string;
  soPhong: string;
  maLoaiPhong: string;
  tenLoaiPhong?: string;
  giaTien?: number;
  trangThai: string;
  thumbnail?: string;
  hinhAnh?: string;
  tang?: number;
  ngayTao?: string;
  ngaySua?: string;
}

interface RoomType {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  moTa: string;
  anhDaiDien?: string;
}

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<Room>({ 
    maPhong: "", 
    soPhong: "", 
    maLoaiPhong: "", 
    giaTien: 0,
    trangThai: "",
    tang: 1 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách phòng và loại phòng từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Lấy danh sách loại phòng
        const roomTypesData = await getRoomTypes();
        setRoomTypes(roomTypesData);
        
        // Lấy danh sách phòng
        const roomsData = await getRooms();
        
        // Kết hợp thông tin loại phòng vào danh sách phòng và đảm bảo giaTien luôn là số
        const roomsWithTypes = roomsData.map((room: Room) => {
          const roomType = roomTypesData.find((type: RoomType) => type.maLoaiPhong === room.maLoaiPhong);
          return {
            ...room,
            giaTien: room.giaTien || 0, // Đảm bảo giaTien không null hoặc undefined
            tenLoaiPhong: roomType?.tenLoaiPhong || "Không xác định"
          };
        });
        
        setRooms(roomsWithTypes);
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mở modal Thêm mới
  const openAddModal = () => {
    setForm({ maPhong: "", soPhong: "", maLoaiPhong: "", giaTien: 0, trangThai: "", tang: 1 });
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
    setForm({ maPhong: "", soPhong: "", maLoaiPhong: "", giaTien: 0, trangThai: "", tang: 1 });
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'giaTien' ? Number(value) : value });
  };

  // Xác nhận xóa phòng
  const handleDelete = async (maPhong: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
        
        console.log(`Đang xóa phòng: ${maPhong}`);
        
        // Sử dụng hàm API deleteRoom
        await deleteRoom(maPhong);
        
        // Cập nhật danh sách phòng sau khi xóa
        setRooms(rooms.filter(room => room.maPhong !== maPhong));
        alert('Xóa phòng thành công');
      } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
        console.error("Error deleting room:", err);
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
      const normalizedForm: any = {
        ...form,
        giaTien: Number(form.giaTien) || 0
      };
      
      // Thêm ngày tạo/sửa theo đúng yêu cầu backend
      if (editingRoom) {
        normalizedForm.ngaySua = new Date().toISOString(); // Cập nhật ngày sửa khi edit
      } else {
        normalizedForm.ngayTao = new Date().toISOString(); // Thêm ngày tạo khi thêm mới
      }
      
      console.log("Dữ liệu phòng:", normalizedForm);
      
      let result;
      
      if (editingRoom) {
        // Cập nhật phòng với hàm API mới
        result = await updateRoom(editingRoom.maPhong, normalizedForm);
      } else {
        // Thêm phòng mới với hàm API mới
        result = await createRoom(normalizedForm);
      }
      
      console.log("Kết quả API:", result);
      
      // Lấy lại danh sách phòng để có dữ liệu mới nhất
      const updatedRooms = await getRooms();
      
      // Kết hợp lại với thông tin loại phòng
      const updatedRoomsWithTypes = updatedRooms.map((room: Room) => {
        const roomType = roomTypes.find((type: RoomType) => type.maLoaiPhong === room.maLoaiPhong);
        return {
          ...room,
          giaTien: room.giaTien || 0, // Đảm bảo giaTien luôn là số
          tenLoaiPhong: roomType?.tenLoaiPhong || "Không xác định"
        };
      });
      
      setRooms(updatedRoomsWithTypes);
      closeModal();
      alert(editingRoom ? 'Cập nhật phòng thành công' : 'Thêm phòng thành công');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      console.error("Error saving room:", err);
    }
  };

  // Hàm render trạng thái với màu sắc
  const renderStatus = (status: string) => {
    if (status === 'Trống') return <span className={`${styles.status} ${styles['status-empty']}`}>Trống</span>;
    if (status === 'Đã đặt') return <span className={`${styles.status} ${styles['status-booked']}`}>Đã đặt</span>;
    if (status === 'Đang dọn') return <span className={`${styles.status} ${styles['status-cleaning']}`}>Đang dọn</span>;
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
                <tr key={room.maPhong}>
                  <td>{room.maPhong}</td>
                  <td>{room.soPhong}</td>
                  <td>{room.tenLoaiPhong}</td>
                  <td>{(room.giaTien || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</td>
                  <td>{room.tang || "-"}</td>
                  <td>{renderStatus(room.trangThai)}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => openEditModal(room)}>Sửa</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(room.maPhong)}>Xóa</button>
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
                  name="soPhong" 
                  value={form.soPhong} 
                  onChange={handleChange} 
                  placeholder="Số phòng" 
                  required 
                />
              </div>
              <div>
                <label>Loại phòng:</label>
                <select 
                  name="maLoaiPhong" 
                  value={form.maLoaiPhong} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Chọn loại phòng</option>
                  {roomTypes.map(type => (
                    <option key={type.maLoaiPhong} value={type.maLoaiPhong}>
                      {type.tenLoaiPhong}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Giá (VNĐ):</label>
                <input 
                  name="giaTien" 
                  type="number" 
                  value={form.giaTien} 
                  onChange={handleChange} 
                  placeholder="Giá phòng" 
                  required 
                  min={0} 
                />
              </div>
              <div>
                <label>Trạng thái:</label>
                <select 
                  name="trangThai" 
                  value={form.trangThai} 
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
                  name="tang"
                  type="number"
                  value={form.tang}
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