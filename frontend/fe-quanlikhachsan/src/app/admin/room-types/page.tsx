'use client';
import React, { useState, useEffect } from "react";
import styles from "./RoomTypeManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, handleResponse, getFormDataHeaders } from '@/lib/api';
import { LoaiPhongDTO, CreateLoaiPhongDTO } from '@/lib/DTOs';
import Image from 'next/image';

interface RoomTypeFormState {
  MaLoaiPhong?: string;
  TenLoaiPhong: string;
  MoTa?: string;
  GiaMoiGio?: number;
  GiaMoiDem: number;
  SoPhongTam?: number;
  SoGiuongNgu: number;
  GiuongDoi?: number;
  GiuongDon?: number;
  KichThuocPhong: number;
  SucChua: number;
  Thumbnail?: File;
}

export default function RoomTypeManager() {
  const [roomTypes, setRoomTypes] = useState<LoaiPhongDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<LoaiPhongDTO | null>(null);
  const [form, setForm] = useState<RoomTypeFormState>({
    TenLoaiPhong: "",
    MoTa: "",
    GiaMoiGio: 0,
    GiaMoiDem: 0,
    SoPhongTam: 1,
    SoGiuongNgu: 1,
    GiuongDoi: 0,
    GiuongDon: 0,
    KichThuocPhong: 20,
    SucChua: 2,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token không hợp lệ hoặc bạn chưa đăng nhập.");

      const headers = await getAuthHeaders('GET');
      const response = await fetch(`${API_BASE_URL}/LoaiPhong`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      const data: LoaiPhongDTO[] = await handleResponse(response);
      setRoomTypes(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "Có lỗi xảy ra khi tải dữ liệu loại phòng.");
      console.error("Error fetching room types:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({
      TenLoaiPhong: "",
      MoTa: "",
      GiaMoiGio: 0,
      GiaMoiDem: 0,
      SoPhongTam: 1,
      SoGiuongNgu: 1,
      GiuongDoi: 0,
      GiuongDon: 0,
      KichThuocPhong: 20,
      SucChua: 2,
    });
    setSelectedThumbnailFile(null);
    setEditingRoomType(null);
    setShowModal(true);
  };

  const openEditModal = (roomType: LoaiPhongDTO) => {
    setForm({
      MaLoaiPhong: roomType.maLoaiPhong,
      TenLoaiPhong: roomType.tenLoaiPhong,
      MoTa: roomType.moTa || "",
      GiaMoiGio: roomType.giaMoiGio,
      GiaMoiDem: roomType.giaMoiDem,
      SoPhongTam: roomType.soPhongTam,
      SoGiuongNgu: roomType.soGiuongNgu,
      GiuongDoi: roomType.giuongDoi || 0,
      GiuongDon: roomType.giuongDon || 0,
      KichThuocPhong: roomType.kichThuocPhong,
      SucChua: roomType.sucChua,
    });
    setSelectedThumbnailFile(null);
    setEditingRoomType(roomType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoomType(null);
    setForm({
      TenLoaiPhong: "",
      MoTa: "",
      GiaMoiGio: 0,
      GiaMoiDem: 0,
      SoPhongTam: 1,
      SoGiuongNgu: 1,
      GiuongDoi: 0,
      GiuongDon: 0,
      KichThuocPhong: 20,
      SucChua: 2,
    });
    setSelectedThumbnailFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedThumbnailFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setForm(prevForm => ({
      ...prevForm,
      [name]: ['GiaMoiGio', 'GiaMoiDem', 'SoPhongTam', 'SoGiuongNgu', 'GiuongDoi', 'GiuongDon', 'KichThuocPhong', 'SucChua'].includes(name) 
        ? (value === '' ? 0 : Number(value)) 
        : value
    }));
  };

  const handleDelete = async (maLoaiPhong: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại phòng này? Điều này có thể ảnh hưởng đến các phòng đã tồn tại.')) {
      setIsLoading(true);
      try {
        const headers = await getFormDataHeaders();
        const response = await fetch(`${API_BASE_URL}/LoaiPhong/${maLoaiPhong}`, {
          method: 'DELETE',
          headers: headers,
          credentials: 'include',
        });

        await handleResponse(response);
        await fetchRoomTypes();
        alert('Xóa loại phòng thành công');
      } catch (err) {
        const e = err as Error;
        alert(`Lỗi: ${e.message}`);
        console.error("Error deleting room type:", e);
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
      formData.append('TenLoaiPhong', form.TenLoaiPhong);
      if (form.MoTa) formData.append('MoTa', form.MoTa);
      formData.append('GiaMoiGio', String(form.GiaMoiGio));
      formData.append('GiaMoiDem', String(form.GiaMoiDem));
      formData.append('SoPhongTam', String(form.SoPhongTam));
      formData.append('SoGiuongNgu', String(form.SoGiuongNgu));
      if (form.GiuongDoi !== undefined) formData.append('GiuongDoi', String(form.GiuongDoi));
      if (form.GiuongDon !== undefined) formData.append('GiuongDon', String(form.GiuongDon));
      formData.append('KichThuocPhong', String(form.KichThuocPhong));
      formData.append('SucChua', String(form.SucChua));

      if (selectedThumbnailFile) {
        formData.append('Thumbnail', selectedThumbnailFile);
      }

      let response;
      const headers = await getFormDataHeaders();
      
      if (editingRoomType) {
        response = await fetch(`${API_BASE_URL}/LoaiPhong/${editingRoomType.maLoaiPhong}`, {
          method: 'PUT',
          headers: headers,
          body: formData,
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE_URL}/LoaiPhong`, {
          method: 'POST',
          headers: headers,
          body: formData,
          credentials: 'include',
        });
      }

      await handleResponse(response);
      await fetchRoomTypes();
      closeModal();
      alert(editingRoomType ? "Cập nhật loại phòng thành công!" : "Thêm loại phòng thành công!");

    } catch (err) {
      const e = err as Error;
      alert(`Lỗi: ${e.message}`);
      console.error("Error submitting room type:", e);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý loại phòng</h2>
        <button className={styles.addBtn} onClick={openAddModal}>+ Thêm loại phòng</button>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}

      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã loại phòng</th>
                <th>Tên loại phòng</th>
                <th>Hình ảnh</th>
                <th>Giá đêm (VNĐ)</th>
                <th>Giá giờ (VNĐ)</th>
                <th>Sức chứa</th>
                <th>Diện tích (m²)</th>
                <th>Số giường</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map(roomType => (
                <tr key={roomType.maLoaiPhong}>
                  <td>{roomType.maLoaiPhong}</td>
                  <td>
                    <div>
                      <strong>{roomType.tenLoaiPhong}</strong>
                      {roomType.moTa && (
                        <div className={styles.description}>
                          {roomType.moTa.length > 50 
                            ? `${roomType.moTa.substring(0, 50)}...` 
                            : roomType.moTa}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {roomType.thumbnail ? (
                      <Image
                        src={roomType.thumbnail}
                        alt={`Thumbnail ${roomType.tenLoaiPhong}`}
                        width={60}
                        height={60}
                        className={styles.thumbnail}
                      />
                    ) : (
                      <div className={styles.noImage}>Không có ảnh</div>
                    )}
                  </td>
                  <td>{formatCurrency(roomType.giaMoiDem)}</td>
                  <td>{formatCurrency(roomType.giaMoiGio ?? 0)}</td>
                  <td>{roomType.sucChua} người</td>
                  <td>{roomType.kichThuocPhong} m²</td>
                  <td>
                    <div className={styles.bedInfo}>
                      <div>Tổng: {roomType.soGiuongNgu}</div>
                      {roomType.giuongDoi ? <div>Đôi: {roomType.giuongDoi}</div> : null}
                      {roomType.giuongDon ? <div>Đơn: {roomType.giuongDon}</div> : null}
                    </div>
                  </td>
                  <td>
                    <button className={styles.editBtn} onClick={() => openEditModal(roomType)}>Sửa</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(roomType.maLoaiPhong)}>Xóa</button>
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
            <h3>{editingRoomType ? 'Sửa loại phòng' : 'Thêm loại phòng'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tên loại phòng:</label>
                  <input
                    name="TenLoaiPhong"
                    value={form.TenLoaiPhong}
                    onChange={handleChange}
                    placeholder="Tên loại phòng"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả:</label>
                  <textarea
                    name="MoTa"
                    value={form.MoTa}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết về loại phòng"
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Giá mỗi đêm (VNĐ):</label>
                  <input
                    name="GiaMoiDem"
                    type="number"
                    value={form.GiaMoiDem}
                    onChange={handleChange}
                    placeholder="Giá mỗi đêm"
                    min="0"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Giá mỗi giờ (VNĐ):</label>
                  <input
                    name="GiaMoiGio"
                    type="number"
                    value={form.GiaMoiGio}
                    onChange={handleChange}
                    placeholder="Giá mỗi giờ"
                    min="0"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Sức chứa (người):</label>
                  <input
                    name="SucChua"
                    type="number"
                    value={form.SucChua}
                    onChange={handleChange}
                    placeholder="Số người tối đa"
                    min="1"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Diện tích (m²):</label>
                  <input
                    name="KichThuocPhong"
                    type="number"
                    value={form.KichThuocPhong}
                    onChange={handleChange}
                    placeholder="Diện tích phòng"
                    min="1"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Số phòng tắm:</label>
                  <input
                    name="SoPhongTam"
                    type="number"
                    value={form.SoPhongTam}
                    onChange={handleChange}
                    placeholder="Số phòng tắm"
                    min="1"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tổng số giường:</label>
                  <input
                    name="SoGiuongNgu"
                    type="number"
                    value={form.SoGiuongNgu}
                    onChange={handleChange}
                    placeholder="Tổng số giường"
                    min="1"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Số giường đôi:</label>
                  <input
                    name="GiuongDoi"
                    type="number"
                    value={form.GiuongDoi || 0}
                    onChange={handleChange}
                    placeholder="Số giường đôi"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Số giường đơn:</label>
                  <input
                    name="GiuongDon"
                    type="number"
                    value={form.GiuongDon || 0}
                    onChange={handleChange}
                    placeholder="Số giường đơn"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Hình ảnh đại diện:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {editingRoomType?.thumbnail && !selectedThumbnailFile && (
                    <div className={styles.currentImage}>
                      <Image
                        src={editingRoomType.thumbnail}
                        alt="Current thumbnail"
                        width={100}
                        height={100}
                      />
                      <span>Ảnh hiện tại</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingRoomType ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}