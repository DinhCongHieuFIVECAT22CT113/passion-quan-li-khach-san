'use client';
import React, { useState, useEffect } from "react";
import styles from "./RoomManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, handleResponse, getFormDataHeaders } from '@/lib/api';
import { getSignalRConnection } from '@/lib/signalr';
import Image from 'next/image';
import Pagination from "@/components/admin/Pagination";

interface PhongBE {
  maPhong: string;
  maLoaiPhong: string;
  soPhong: string;
  thumbnail?: string;
  hinhAnh?: string;
  trangThai: string; // Ensure this is always present
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
  TrangThai: string; // Add TrangThai to the form state
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
    TrangThai: "Trống", // Default status for new rooms
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [selectedHinhAnhFile, setSelectedHinhAnhFile] = useState<File | null>(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Define possible room statuses
  const roomStatuses = ["Trống", "Đã đặt", "Đang dọn"]; // You might fetch these from an API or define them

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token không hợp lệ hoặc bạn chưa đăng nhập.");

      const roomsHeaders = await getAuthHeaders('GET');
      const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
        method: 'GET',
        headers: roomsHeaders,
        credentials: 'include'
      });
      const roomsData: PhongBE[] = await handleResponse(roomsResponse);

      const roomTypesHeaders = await getAuthHeaders('GET');
      const roomTypesResponse = await fetch(`${API_BASE_URL}/LoaiPhong`, {
        method: 'GET',
        headers: roomTypesHeaders,
        credentials: 'include'
      });
      const roomTypesData: LoaiPhongBE[] = await handleResponse(roomTypesResponse);
      setRoomTypes(roomTypesData);

      const roomsWithDetails = roomsData.map((phong): RoomDisplay => {
        const loaiPhong = roomTypesData.find(lp => lp.maLoaiPhong === phong.maLoaiPhong);

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

  useEffect(() => {
    fetchData();

    // Đăng ký lắng nghe sự kiện từ SignalR
    const connection = getSignalRConnection();

    // Khi nhận được thông báo về thay đổi trạng thái phòng, làm mới dữ liệu
    const handleRoomStatusChanged = (notification: any) => {
      if (notification.type === 'room_status_changed' ||
          notification.type === 'booking_created' ||
          notification.type === 'booking_status_changed') {
        console.log('Room data changed, refreshing...', notification);
        fetchData();
      }
    };

    connection.on('ReceiveNotification', handleRoomStatusChanged);

    // Cleanup
    return () => {
      connection.off('ReceiveNotification', handleRoomStatusChanged);
    };
  }, []);

  const openAddModal = () => {
    setForm({
      SoPhong: "",
      MaLoaiPhong: roomTypes.length > 0 ? roomTypes[0].maLoaiPhong : "",
      Tang: 1,
      Thumbnail: undefined,
      HinhAnh: undefined,
      TrangThai: "Trống", // Default status for new rooms
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
      TrangThai: room.trangThai, // Set current status for editing
    });
    setSelectedThumbnailFile(null);
    setSelectedHinhAnhFile(null);
    setEditingRoom(room);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setForm({ SoPhong: "", MaLoaiPhong: "", Tang: 1, TrangThai: "Trống" }); // Reset status on close
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

    // If changing room type, automatically update thumbnail from room type if no new file is selected
    if (name === 'MaLoaiPhong') {
      const selectedRoomType = roomTypes.find(rt => rt.maLoaiPhong === value);
      if (selectedRoomType && selectedRoomType.thumbnail) {
        if (!selectedThumbnailFile) { // Only update if user hasn't selected a new file
          setForm(prevForm => ({
            ...prevForm,
            [name]: value,
            Thumbnail: selectedRoomType.thumbnail
          }));
          return;
        }
      }
    }

    setForm(prevForm => ({
      ...prevForm,
      [name]: (name === 'Tang') ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleDelete = async (maPhongToDelete: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      setIsLoading(true);
      try {
        const headers = await getFormDataHeaders();
        const response = await fetch(`${API_BASE_URL}/Phong/${maPhongToDelete}`, {
          method: 'DELETE',
          headers: headers,
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
      formData.append('TrangThai', form.TrangThai); // Append the status to formData

      if (selectedThumbnailFile) {
        formData.append('ThumbnailFile', selectedThumbnailFile);
      } else if (editingRoom && typeof form.Thumbnail === 'string') {
        // If no new file selected but there's an existing URL, send it to preserve it
        formData.append('ThumbnailUrl', form.Thumbnail);
      }
      if (selectedHinhAnhFile) {
        formData.append('HinhAnhFile', selectedHinhAnhFile);
      } else if (editingRoom && typeof form.HinhAnh === 'string') {
          // If no new file selected but there's an existing URL, send it to preserve it
          formData.append('HinhAnhUrl', form.HinhAnh);
      }


      let response;
      const maPhongBeingEdited = editingRoom?.maPhong;

      const headers = await getFormDataHeaders(); // Ensure this handles FormData correctly, typically you don't set 'Content-Type' for FormData manually as fetch does it.

      if (maPhongBeingEdited) {
        response = await fetch(`${API_BASE_URL}/Phong/${maPhongBeingEdited}`, {
          method: 'PUT',
          headers: headers, // Headers might not need 'Content-Type' for FormData, let browser set it.
          body: formData,
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE_URL}/Phong`, {
          method: 'POST',
          headers: headers, // Headers might not need 'Content-Type' for FormData, let browser set it.
          body: formData,
          credentials: 'include',
        });
      }

      await handleResponse(response);

      // Re-fetch data to update the table with the latest changes
      fetchData(); // Call fetchData to get fresh data including updated status

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

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rooms.length / itemsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Hàm thay đổi số lượng hiển thị
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng hiển thị
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={rooms.length}
          onPageChange={paginate}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[5, 10, 20, 50]}
        />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã phòng</th>
              <th>Thumbnail</th>
              <th>Ảnh chi tiết</th>
              <th>Số phòng</th>
              <th>Loại phòng</th>
              <th>Giá Đêm / Giờ (VNĐ)</th>
              <th>Tầng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(room => (
              <tr key={room.maPhong}>
                <td>{room.maPhong}</td>
                <td>
                  {room.thumbnail ? (
                    <Image
                      src={room.thumbnail}
                      alt={`Thumbnail ${room.soPhong}`}
                      width={50}
                      height={50}
                      className={styles.thumbnail}
                    />
                  ) : (
                    <span style={{color:'#888', fontSize:12}}>Không có</span>
                  )}
                </td>
                <td>
                  {room.hinhAnh ? (
                    <Image
                      src={room.hinhAnh}
                      alt={`Ảnh chi tiết ${room.soPhong}`}
                      width={100}
                      height={70}
                      className={styles.imagePreview}
                      style={{objectFit:'cover', borderRadius:8}}
                    />
                  ) : (
                    <span style={{color:'#888', fontSize:12}}>Không có</span>
                  )}
                </td>
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
              <div className={styles.formGroup}> {/* Add formGroup class */}
                <label>Số phòng:</label>
                <input
                  name="SoPhong"
                  value={form.SoPhong}
                  onChange={handleChange}
                  placeholder="Số phòng"
                  required
                />
              </div>
              <div className={styles.formGroup}> {/* Add formGroup class */}
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
              <div className={styles.formGroup}> {/* Add formGroup class */}
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
              <div className={styles.formGroup}> {/* Add formGroup class for status */}
                <label>Trạng thái:</label>
                <select
                  name="TrangThai"
                  value={form.TrangThai}
                  onChange={handleChange}
                  required
                >
                  {roomStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}> {/* Add formGroup class */}
                <label htmlFor="Thumbnail">Thumbnail:</label>
                <input type="file" id="Thumbnail" name="Thumbnail" onChange={(e) => handleFileChange(e, 'thumbnail')} />

                {/* Hiển thị thumbnail hiện tại hoặc từ loại phòng */}
                {!selectedThumbnailFile && form.Thumbnail && typeof form.Thumbnail === 'string' && (
                  <div className={styles.imagePreviewContainer}>
                    <p>Thumbnail hiện tại:</p>
                    <Image src={form.Thumbnail} alt="Thumbnail hiện tại" width={100} height={100} className={styles.imagePreview} />
                  </div>
                )}

                {/* Hiển thị thumbnail mới được chọn */}
                {selectedThumbnailFile && (
                  <div className={styles.imagePreviewContainer}>
                    <p>Thumbnail mới:</p>
                    <Image src={URL.createObjectURL(selectedThumbnailFile)} alt="Preview thumbnail" width={100} height={100} className={styles.imagePreview} />
                  </div>
                )}

                {/* Thông báo khi tự động lấy từ loại phòng */}
                {!editingRoom && !selectedThumbnailFile && form.Thumbnail && typeof form.Thumbnail === 'string' && (
                  <p className={styles.autoImageNote}>📷 Tự động sử dụng hình ảnh từ loại phòng</p>
                )}
              </div>
              <div className={styles.formGroup}> {/* Add formGroup class */}
                <label htmlFor="HinhAnh">Ảnh chi tiết:</label>
                <input type="file" id="HinhAnh" name="HinhAnh" onChange={(e) => handleFileChange(e, 'hinhAnh')} />
                {editingRoom && editingRoom.hinhAnh && typeof editingRoom.hinhAnh === 'string' && (
                  <div className={styles.imagePreviewContainer}>
                    <p>Ảnh chi tiết hiện tại:</p>
                    <Image src={editingRoom.hinhAnh} alt="Hình ảnh chi tiết hiện tại" width={100} height={100} className={styles.imagePreview} />
                  </div>
                )}
                {selectedHinhAnhFile && (
                  <div className={styles.imagePreviewContainer}>
                    <p>Ảnh chi tiết mới:</p>
                    <Image src={URL.createObjectURL(selectedHinhAnhFile)} alt="Preview hình ảnh chi tiết" width={100} height={100} className={styles.imagePreview} />
                  </div>
                )}
              </div>

              <div className={styles.buttonGroup}> {/* Use buttonGroup (or .formActions) */}
                <button type="submit" className={styles.submitBtn}>{editingRoom ? 'Lưu' : 'Thêm'}</button>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}