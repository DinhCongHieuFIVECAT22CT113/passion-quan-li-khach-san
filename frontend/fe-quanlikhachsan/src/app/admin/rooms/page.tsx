'use client';
import React, { useState, useEffect } from "react";
import styles from "./RoomManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, handleResponse, getFormDataHeaders } from '@/lib/api';

interface PhongBE {
  maPhong: string;
  maLoaiPhong: string;
  soPhong: string;
  thumbnail?: string;
  hinhAnh?: string;
  trangThai: string;
  tang?: number;
}

interface LoaiPhongBE {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  moTa?: string;
  giaMoiGio: number;
  giaMoiDem: number;
  soPhongTam: number;
  soGiuongNgu: number;
  giuongDoi?: number;
  giuongDon?: number;
  kichThuocPhong: number;
  sucChua: number;
  thumbnail?: string;
}

interface RoomDisplay extends PhongBE {
  tenLoaiPhong?: string;
  donGia?: number;
  giaGio?: number;
}

interface RoomFormState {
  MaPhong?: string;
  SoPhong: string;
  MaLoaiPhong: string;
  Thumbnail?: string | File;
  HinhAnh?: string | File;
  Tang?: number;
}

export default function RoomManager() {
  const [rooms, setRooms] = useState<RoomDisplay[]>([]);
  const [roomTypes, setRoomTypes] = useState<LoaiPhongBE[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomDisplay | null>(null);
  const [form, setForm] = useState<RoomFormState>({ 
    SoPhong: "", 
    MaLoaiPhong: "", 
    Tang: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [selectedHinhAnhFile, setSelectedHinhAnhFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token không hợp lệ hoặc bạn chưa đăng nhập.");

        const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        const roomsData: PhongBE[] = await handleResponse(roomsResponse);
        
        const roomTypesResponse = await fetch(`${API_BASE_URL}/LoaiPhong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        const roomTypesData: LoaiPhongBE[] = await handleResponse(roomTypesResponse);
        console.log("DEBUG: Fetched roomTypesData:", JSON.parse(JSON.stringify(roomTypesData)));
        setRoomTypes(roomTypesData);
        
        const roomsWithDetails = roomsData.map((phong): RoomDisplay => {
          const loaiPhong = roomTypesData.find(lp => lp.maLoaiPhong === phong.maLoaiPhong);
          
          if (phong.maPhong === 'P001' || phong.maPhong === 'P002') {
            console.log(`DEBUG: Processing phong ${phong.maPhong} with maLoaiPhong ${phong.maLoaiPhong}`);
            console.log("DEBUG: Found loaiPhong object:", JSON.parse(JSON.stringify(loaiPhong)));
            console.log("DEBUG: Value of loaiPhong?.giaMoiGio:", loaiPhong?.giaMoiGio);
          }

          const roomDetail: RoomDisplay = {
            ...phong,
            tenLoaiPhong: loaiPhong?.tenLoaiPhong || "Không xác định",
            donGia: loaiPhong?.giaMoiDem || 0,
            giaGio: loaiPhong?.giaMoiGio || 0,
          };
          return roomDetail;
        });
        
        setRooms(roomsWithDetails);
      } catch (err) {
        const e = err as Error;
        setError(e.message || "Có lỗi xảy ra khi tải dữ liệu phòng.");
        console.error("Error fetching data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const openAddModal = () => {
    setForm({ 
      SoPhong: "", 
      MaLoaiPhong: roomTypes.length > 0 ? roomTypes[0].maLoaiPhong : "",
      Tang: 1,
      Thumbnail: undefined,
      HinhAnh: undefined,
    });
    setSelectedThumbnailFile(null);
    setSelectedHinhAnhFile(null);
    setEditingRoom(null);
    setShowModal(true);
  };

  const openEditModal = (room: RoomDisplay) => {
    setForm({
      MaPhong: room.maPhong,
      SoPhong: room.soPhong,
      MaLoaiPhong: room.maLoaiPhong,
      Tang: room.tang,
      Thumbnail: room.thumbnail, 
      HinhAnh: room.hinhAnh,
    });
    setSelectedThumbnailFile(null);
    setSelectedHinhAnhFile(null);
    setEditingRoom(room);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setForm({ SoPhong: "", MaLoaiPhong: "", Tang: 1 });
    setSelectedThumbnailFile(null);
    setSelectedHinhAnhFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'thumbnail' | 'hinhAnh') => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (fileType === 'thumbnail') {
        setSelectedThumbnailFile(file);
      } else if (fileType === 'hinhAnh') {
        setSelectedHinhAnhFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ 
      ...prevForm, 
      [name]: (name === 'Tang') ? (value === '' ? undefined : Number(value)) : value 
    }));
  };

  const handleDelete = async (maPhongToDelete: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        
        const response = await fetch(`${API_BASE_URL}/Phong/${maPhongToDelete}`, {
          method: 'DELETE',
          headers: getFormDataHeaders(),
          credentials: 'include',
        });
        
        await handleResponse(response);
        
        setRooms(rooms.filter(room => room.maPhong !== maPhongToDelete));
        alert('Xóa phòng thành công');
      } catch (err) {
        const e = err as Error;
        alert(`Lỗi: ${e.message}`);
        console.error("Error deleting room:", e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      formData.append('SoPhong', form.SoPhong);
      formData.append('MaLoaiPhong', form.MaLoaiPhong);
      if (form.Tang !== undefined) {
        formData.append('Tang', String(form.Tang));
      }

      if (selectedThumbnailFile) {
        formData.append('ThumbnailFile', selectedThumbnailFile);
      }
      if (selectedHinhAnhFile) {
        formData.append('HinhAnhFile', selectedHinhAnhFile);
      }
      
      let response;
      const maPhongBeingEdited = editingRoom?.maPhong;
      
      if (maPhongBeingEdited) {
        response = await fetch(`${API_BASE_URL}/Phong/${maPhongBeingEdited}`, {
          method: 'PUT',
          headers: getFormDataHeaders(),
          body: formData,
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE_URL}/Phong`, {
          method: 'POST',
          headers: getFormDataHeaders(),
          body: formData,
          credentials: 'include',
        });
      }
      
      await handleResponse(response);
      
      const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      const roomsData: PhongBE[] = await handleResponse(roomsResponse);
      const roomsWithDetails = roomsData.map((phong): RoomDisplay => {
        const loaiPhong = roomTypes.find(lp => lp.maLoaiPhong === phong.maLoaiPhong);
        return {
          ...phong,
          tenLoaiPhong: loaiPhong?.tenLoaiPhong || "Không xác định",
          donGia: loaiPhong?.giaMoiDem || 0,
          giaGio: loaiPhong?.giaMoiGio || 0,
        };
      });
      setRooms(roomsWithDetails);
            
      closeModal();
      alert(editingRoom ? "Cập nhật phòng thành công!" : "Thêm phòng thành công!");

    } catch (err) {
      const e = err as Error;
      alert(`Lỗi: ${e.message}`);
      console.error("Error submitting room:", e);
    }
  };

  const renderStatus = (status: string) => {
    if (status && status.toLowerCase() === 'trống' || status.toLowerCase() === 'empty') return <span className={`${styles.status} ${styles['status-empty']}`}>Trống</span>;
    if (status && status.toLowerCase() === 'đã đặt' || status.toLowerCase() === 'booked') return <span className={`${styles.status} ${styles['status-booked']}`}>Đã đặt</span>;
    if (status && status.toLowerCase() === 'đang dọn' || status.toLowerCase() === 'cleaning' || status.toLowerCase() === 'đang dọn dẹp') return <span className={`${styles.status} ${styles['status-cleaning']}`}>Đang dọn</span>;
    return <span className={styles.status}>{status || "N/A"}</span>;
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
              <th>Giá Đêm / Giờ (VNĐ)</th>
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
                <td>
                  {(room.donGia || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} 
                  / {(room.giaGio || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </td>
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
                  name="SoPhong"
                  value={form.SoPhong} 
                  onChange={handleChange} 
                  placeholder="Số phòng" 
                  required 
                />
              </div>
              <div>
                <label>Loại phòng:</label>
                <select 
                  name="MaLoaiPhong"
                  value={form.MaLoaiPhong} 
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
                <label>Tầng:</label>
                <input
                  name="Tang"
                  type="number"
                  value={form.Tang ?? ''}
                  onChange={handleChange}
                  placeholder="Tầng"
                  min="1"
                  required
                />
              </div>
              <div>
                <label>Thumbnail:</label>
                {editingRoom && form.Thumbnail && typeof form.Thumbnail === 'string' && 
                  <img src={`${API_BASE_URL}${form.Thumbnail}`} alt="Thumbnail" style={{maxWidth: '100px', maxHeight: '100px'}}/>
                }
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'thumbnail')} 
                />
              </div>
               <div>
                <label>Hình ảnh:</label>
                {editingRoom && form.HinhAnh && typeof form.HinhAnh === 'string' && 
                  <img src={`${API_BASE_URL}${form.HinhAnh}`} alt="Hình ảnh" style={{maxWidth: '100px', maxHeight: '100px'}}/>
                }
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'hinhAnh')} 
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