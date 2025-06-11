'use client';
import React, { useState, useEffect } from "react";
import styles from "./ServiceManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getValidImageSrc } from '@/config/supabase';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '@/lib/api';
import Image from 'next/image';
import Pagination from "@/components/admin/Pagination";

// Interface cho dữ liệu nhận từ BE (camelCase, khớp với log)
interface ServiceBE {
  maDichVu: string;
  tenDichVu: string;
  thumbnail?: string; 
  moTa?: string;
  donGia: number; 
  // ngayTao, ngaySua có thể có nếu BE trả về
}

// Interface cho state của form (PascalCase, để gửi đi)
interface ServiceFormState {
  MaDichVu?: string; // Dùng khi sửa, ID qua URL
  TenDichVu: string;
  MoTa?: string;
  DonGia: number;
  Thumbnail?: string; // URL thumbnail hiện tại (để hiển thị), hoặc tên file khi gửi
}

export default function ServiceManager() {
  const [services, setServices] = useState<ServiceBE[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceBE | null>(null); // Dữ liệu gốc là camelCase
  const [form, setForm] = useState<ServiceFormState>({ 
    TenDichVu: "", 
    DonGia: 0, 
    MoTa: "",
    Thumbnail: undefined,
  });
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders('GET');
        const response = await fetch(`${API_BASE_URL}/DichVu`, {
          method: 'GET',
          headers: headers, 
          credentials: 'include'
        });
        
        const data: ServiceBE[] = await handleResponse(response);
        // console.log('Fetched services data:', data); // Đã có log từ user, có thể xóa
        setServices(data);
      } catch (err) {
        const e = err as Error;
        console.error('Lỗi khi lấy danh sách dịch vụ:', e);
        setError(e.message || 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const openAddModal = () => {
    setForm({ // Reset form (PascalCase)
      TenDichVu: "", 
      DonGia: 0, 
      MoTa: "",
      Thumbnail: undefined,
    });
    setSelectedThumbnailFile(null);
    setEditingService(null); // Không có service gốc khi thêm mới
    setShowModal(true);
  };

  const openEditModal = (service: ServiceBE) => { // service là camelCase
    setForm({ // Map từ camelCase (service) sang PascalCase (form state)
      MaDichVu: service.maDichVu,
      TenDichVu: service.tenDichVu,
      DonGia: service.donGia,
      MoTa: service.moTa,
      Thumbnail: service.thumbnail, 
    });
    setSelectedThumbnailFile(null);
    setEditingService(service); // Lưu service gốc (camelCase)
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setForm({ TenDichVu: "", DonGia: 0, MoTa: "", Thumbnail: undefined });
    setSelectedThumbnailFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedThumbnailFile(file);
      // Xóa URL thumbnail cũ trong form nếu chọn file mới
      setForm(prev => ({...prev, Thumbnail: undefined})); 
    } else {
      setSelectedThumbnailFile(null);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; // name là PascalCase từ form input
    setForm(prevForm => ({ 
      ...prevForm, 
      [name]: name === 'DonGia' ? (value === '' ? 0 : Number(value)) : value 
    }));
  };

  const handleDelete = async (maDichVuToDelete: string) => { // maDichVuToDelete là camelCase từ service
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      setIsLoading(true);
      try {
        const headers = await getAuthHeaders('DELETE');
        const response = await fetch(`${API_BASE_URL}/DichVu/${maDichVuToDelete}`, {
          method: 'DELETE',
          headers: headers, 
          credentials: 'include',
        });
        
        await handleResponse(response); 
        
        setServices(prevServices => prevServices.filter(s => s.maDichVu !== maDichVuToDelete));
        alert('Xóa dịch vụ thành công');
      } catch (err) {
        const e = err as Error;
        alert(`Lỗi: ${e.message}`);
        console.error("Error deleting service:", e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      // Các key gửi đi là PascalCase, khớp với form state và BE DTOs
      formData.append('TenDichVu', form.TenDichVu);
      formData.append('DonGia', String(form.DonGia || 0));
      if (form.MoTa) {
        formData.append('MoTa', form.MoTa);
      }

      if (selectedThumbnailFile) {
        // Chỉ gửi file, không gửi tên file
        formData.append('Thumbnail', selectedThumbnailFile); 
        console.log("Đang gửi file mới:", selectedThumbnailFile.name, selectedThumbnailFile.size, "bytes");
      } else if (editingService && form.Thumbnail) { // form.Thumbnail là URL/path cũ (PascalCase)
        // Giữ nguyên URL cũ
        formData.append('ThumbnailUrl', form.Thumbnail);
        console.log("Giữ nguyên URL cũ:", form.Thumbnail);
      } else if (!editingService && !selectedThumbnailFile) {
        alert("Thumbnail là bắt buộc khi thêm mới dịch vụ.");
        setIsLoading(false);
        return;
      }
      
      // console.log("Form data to submit:", Object.fromEntries(formData)); // Có thể xóa nếu đã xác nhận đúng

      let response;
      const headers = await getFormDataHeaders(); 
      const idToUpdate = editingService?.maDichVu; // Lấy ID (camelCase) từ service gốc đang sửa

      if (idToUpdate) { // Nếu có editingService.maDichVu (camelCase)
        response = await fetch(`${API_BASE_URL}/DichVu/${idToUpdate}`, {
          method: 'PUT',
          headers: headers,
          body: formData,
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE_URL}/DichVu`, {
          method: 'POST',
          headers: headers,
          body: formData,
          credentials: 'include',
        });
      }
      
      await handleResponse(response); 
      
      const fetchHeaders = await getAuthHeaders('GET');
      const fetchServicesResponse = await fetch(`${API_BASE_URL}/DichVu`, {
        method: 'GET',
        headers: fetchHeaders,
        credentials: 'include'
      });
      const updatedServicesData: ServiceBE[] = await handleResponse(fetchServicesResponse);
      setServices(updatedServicesData);
      
      closeModal();
      alert(editingService ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ thành công!");

    } catch (err) {
      const e = err as Error;
      alert(`Lỗi: ${e.message}`);
      console.error("Error saving service:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

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
        <h2>Quản lý dịch vụ</h2>
        <button className={styles.addBtn} onClick={openAddModal}>+ Thêm dịch vụ</button>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={services.length}
            onPageChange={paginate}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[5, 10, 20, 50]}
          />

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã dịch vụ</th>
                <th>Tên dịch vụ</th>
                <th>Giá (VNĐ)</th>
                <th>Mô tả</th>
                <th>Thumbnail</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((service) => ( // service ở đây là camelCase từ ServiceBE
                  <tr key={service.maDichVu}>
                    <td>{service.maDichVu || 'N/A'}</td>
                    <td>{service.tenDichVu || 'N/A'}</td>
                    <td>{service.donGia === 0 ? <span className={styles.priceFree}>Miễn phí</span> : (service.donGia || 0).toLocaleString()}</td>
                    <td>{service.moTa || "-"}</td>
                    <td>
                      {service.thumbnail ? (
                        <img 
                            src={getValidImageSrc(service.thumbnail)} 
                            alt={service.tenDichVu || 'thumbnail'} 
                            width={50} 
                            height={50}
                            style={{ objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              e.currentTarget.src = '/images/no-image.png';
                            }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button className={styles.editBtn} onClick={() => openEditModal(service)}>Sửa</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(service.maDichVu)}>Xóa</button>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '16px'}}>Không có dữ liệu dịch vụ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="TenDichVu">Tên dịch vụ:</label>
                <input 
                  id="TenDichVu"
                  name="TenDichVu" 
                  value={form.TenDichVu} 
                  onChange={handleChange} 
                  placeholder="Tên dịch vụ" 
                  required 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="DonGia">Giá (VNĐ):</label>
                <input 
                  id="DonGia"
                  name="DonGia" 
                  type="number" 
                  value={form.DonGia} 
                  onChange={handleChange} 
                  placeholder="Giá" 
                  required 
                  min={0} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="MoTa">Mô tả:</label>
                <textarea 
                  id="MoTa"
                  name="MoTa" 
                  value={form.MoTa || ''} 
                  onChange={handleChange} 
                  placeholder="Mô tả dịch vụ" 
                  rows={3} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Ảnh thumbnail:</label>
                <div className={styles.fileInput}>
                  <label className={styles.fileInputLabel}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                    />
                    Chọn ảnh
                  </label>
                  {selectedThumbnailFile && (
                    <div>Đã chọn: {selectedThumbnailFile.name}</div>
                  )}
                </div>
              </div>
              
              {(form.Thumbnail || editingService?.thumbnail) && (
                <div className={styles.formGroup}>
                  <label>Thumbnail hiện tại:</label>
                  <img 
                    src={getValidImageSrc(form.Thumbnail || editingService?.thumbnail)} 
                    alt="Thumbnail" 
                    className={styles.thumbnailPreview}
                    onError={(e) => {
                      e.currentTarget.src = '/images/no-image.png';
                    }}
                  />
                </div>
              )}
              
              <div className={styles.buttonGroup}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Hủy
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
