'use client';
import React, { useState, useEffect } from "react";
import styles from "./ReviewManager.module.css";
import { getReviews, approveReview, updateReview, deleteReview, getBookingDetails, getAuthHeaders, getFormDataHeaders, handleResponse } from "../../../lib/api";
import { API_BASE_URL } from "../../../lib/config";
import { FaSearch, FaFilter, FaStar, FaCheck, FaEye, FaEyeSlash, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import Pagination from "@/components/admin/Pagination";

interface Review {
  maDG: string;
  maKH?: string;
  maDatPhong?: string;
  tenKhachHang?: string;
  danhGia: number;
  noiDung: string;
  ngayTao: string;
  trangThai: string;
  anHien: boolean;
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<Partial<Review>>({
    tenKhachHang: '',
    danhGia: 5,
    noiDung: '',
    trangThai: 'Chưa duyệt',
    anHien: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Hàm tải dữ liệu đánh giá từ API
  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Lấy dữ liệu đánh giá
      const rawReviewsFromApi: any[] = await getReviews();
      console.log("Raw reviews data from getReviews():", JSON.stringify(rawReviewsFromApi, null, 2));

      // Lấy danh sách khách hàng để hiển thị tên
      const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
        method: 'GET',
        headers: await getAuthHeaders('GET'),
        credentials: 'include'
      });
      const customersData = await handleResponse(customersResponse);
      const customers = Array.isArray(customersData) ? customersData : [];
      console.log("Customers data:", JSON.stringify(customers, null, 2));

      // Lấy danh sách đặt phòng để liên kết với khách hàng
      const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, {
        method: 'GET',
        headers: await getAuthHeaders('GET'),
        credentials: 'include'
      });
      const bookingsData = await handleResponse(bookingsResponse);
      const bookings = Array.isArray(bookingsData) ? bookingsData : [];
      console.log("Bookings data:", JSON.stringify(bookings, null, 2));

      const processedReviews = await Promise.all(rawReviewsFromApi.map(async (apiReview) => {
        const reviewId = apiReview.MaReview || apiReview.maReview;
        const datPhongId = apiReview.MaDatPhong || apiReview.maDatPhong;
        const maKhachHangFromReview = apiReview.MaKH || apiReview.maKH;
        
        // Tìm đặt phòng liên quan
        const booking = bookings.find(b => 
          (b.maDatPhong || b.MaDatPhong) === datPhongId
        );
        
        // Lấy mã khách hàng từ đặt phòng nếu có
        const maKhachHangFromBooking = booking ? (booking.maKH || booking.MaKH) : null;
        
        // Sử dụng mã khách hàng từ review hoặc từ booking
        const maKhachHang = maKhachHangFromReview || maKhachHangFromBooking;
        
        // Tìm thông tin khách hàng
        const customer = customers.find(c => 
          (c.maKh || c.MaKh) === maKhachHang
        );
        
        // Tạo tên hiển thị cho khách hàng
        let tenKhachHangDisplay = 'Khách hàng không xác định';
        if (customer) {
          const ho = customer.hoKh || customer.HoKh || '';
          const ten = customer.tenKh || customer.TenKh || '';
          tenKhachHangDisplay = `${ho} ${ten}`.trim();
        }
        
        console.log(`[Review ${reviewId}] MaKH: ${maKhachHang}, Customer:`, customer);

        return {
          maDG: reviewId,
          maDatPhong: datPhongId,
          maKH: maKhachHang,
          danhGia: apiReview.DanhGia || apiReview.danhGia,
          noiDung: apiReview.BinhLuan || apiReview.binhLuan,
          ngayTao: apiReview.NgayTao || apiReview.ngayTao || null,
          trangThai: apiReview.TrangThai || apiReview.trangThai || 'Chưa duyệt',
          anHien: apiReview.AnHien || apiReview.anHien || false,
          tenKhachHang: tenKhachHangDisplay,
        };
      }));

      console.log("Processed reviews with customer names:", JSON.stringify(processedReviews, null, 2));
      setReviews(processedReviews as Review[]);

    } catch (err) {
      const error = err as Error;
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu đánh giá");
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy danh sách đánh giá từ API khi component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Lọc đánh giá theo tìm kiếm và trạng thái
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.tenKhachHang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.noiDung.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.maDG.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'approved') return matchesSearch && review.trangThai === 'Đã duyệt';
    if (filterStatus === 'pending') return matchesSearch && review.trangThai === 'Chưa duyệt';
    if (filterStatus === 'hidden') return matchesSearch && review.anHien === true;
    
    return matchesSearch;
  });
  
  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  
  // Hàm chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Hàm thay đổi số lượng hiển thị
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng hiển thị
  };

  const handleApprove = async (maDG: string) => {
    try {
      const review = reviews.find(r => r.maDG === maDG);
      if (!review) return;
      
      // Sử dụng FormData để cập nhật trạng thái
      const formData = new FormData();
      formData.append('MaReview', review.maDG);
      if (review.maDatPhong) formData.append('MaDatPhong', review.maDatPhong);
      if (review.maKH) formData.append('MaKH', review.maKH);
      formData.append('DanhGia', String(review.danhGia));
      formData.append('BinhLuan', review.noiDung || '');
      if (review.ngayTao) formData.append('NgayTao', review.ngayTao);
      formData.append('TrangThai', 'Đã duyệt');
      formData.append('AnHien', String(review.anHien));
      
      // Gọi API cập nhật
      const headers = await getFormDataHeaders();
      const response = await fetch(`${API_BASE_URL}/Review/${maDG}`, {
        method: 'PUT',
        headers: headers,
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi duyệt đánh giá: ${errorText}`);
      }
      
      // Cập nhật state
      setReviews(reviews.map(r =>
        r.maDG === maDG ? { ...r, trangThai: 'Đã duyệt' } : r
      ));
      
      // Tải lại dữ liệu từ server để đảm bảo đồng bộ
      fetchReviews();
      
      console.log(`Đã duyệt đánh giá ${maDG} thành công`);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi khi duyệt đánh giá: ${error.message}`);
      console.error("Error approving review:", error);
    }
  };

  const handleHide = async (review: Review) => {
    try {
      // Chuẩn bị dữ liệu cập nhật
      const formData = new FormData();
      formData.append('MaReview', review.maDG);
      if (review.maDatPhong) formData.append('MaDatPhong', review.maDatPhong);
      if (review.maKH) formData.append('MaKH', review.maKH);
      formData.append('DanhGia', String(review.danhGia));
      formData.append('BinhLuan', review.noiDung);
      if (review.ngayTao) formData.append('NgayTao', review.ngayTao);
      formData.append('TrangThai', review.trangThai);
      formData.append('AnHien', String(!review.anHien));
      
      // Gọi API cập nhật
      const headers = await getFormDataHeaders();
      const response = await fetch(`${API_BASE_URL}/Review/${review.maDG}`, {
        method: 'PUT',
        headers: headers,
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi thay đổi trạng thái hiển thị: ${errorText}`);
      }
      
      // Cập nhật state
      setReviews(reviews.map(r =>
        r.maDG === review.maDG ? { ...review, anHien: !review.anHien } : r
      ));
      
      // Tải lại dữ liệu từ server để đảm bảo đồng bộ
      fetchReviews();
      
      console.log(`Đã ${!review.anHien ? 'ẩn' : 'hiện'} đánh giá ${review.maDG} thành công`);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi khi thay đổi trạng thái hiển thị: ${error.message}`);
      console.error("Error toggling review visibility:", error);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData(review);
    setShowModal(true);
  };

  const handleDelete = async (maDG: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        // Gọi API xóa đánh giá
        const headers = await getAuthHeaders('DELETE');
        const response = await fetch(`${API_BASE_URL}/Review/${maDG}`, {
          method: 'DELETE',
          headers: headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Lỗi khi xóa đánh giá: ${errorText}`);
        }
        
        // Cập nhật state
        setReviews(reviews.filter(review => review.maDG !== maDG));
        
        // Tải lại dữ liệu từ server để đảm bảo đồng bộ
        fetchReviews();
        
        console.log(`Đã xóa đánh giá ${maDG} thành công`);
      } catch (err) {
        const error = err as Error;
        alert(`Lỗi khi xóa đánh giá: ${error.message}`);
        console.error("Error deleting review:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        // Chuẩn bị dữ liệu cập nhật
        const formData2 = new FormData();
        formData2.append('MaReview', editingReview.maDG);
        if (editingReview.maDatPhong) formData2.append('MaDatPhong', editingReview.maDatPhong);
        if (editingReview.maKH) formData2.append('MaKH', editingReview.maKH);
        formData2.append('DanhGia', String(formData.danhGia));
        formData2.append('BinhLuan', formData.noiDung || '');
        if (editingReview.ngayTao) formData2.append('NgayTao', editingReview.ngayTao);
        formData2.append('TrangThai', formData.trangThai || 'Chưa duyệt');
        formData2.append('AnHien', String(formData.anHien));
        
        // Gọi API cập nhật
        const headers = await getFormDataHeaders();
        const response = await fetch(`${API_BASE_URL}/Review/${editingReview.maDG}`, {
          method: 'PUT',
          headers: headers,
          body: formData2,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Lỗi khi cập nhật đánh giá: ${errorText}`);
        }
        
        // Cập nhật state
        setReviews(reviews.map(review =>
          review.maDG === editingReview.maDG ? { 
            ...review, 
            danhGia: formData.danhGia || review.danhGia,
            noiDung: formData.noiDung || review.noiDung,
            trangThai: formData.trangThai || review.trangThai,
            anHien: formData.anHien !== undefined ? formData.anHien : review.anHien
          } : review
        ));
        
        // Tải lại dữ liệu từ server để đảm bảo đồng bộ
        fetchReviews();
        
        console.log(`Đã cập nhật đánh giá ${editingReview.maDG} thành công`);
      } else {
        alert("Chức năng thêm đánh giá không được hỗ trợ. Đánh giá thường do khách hàng tạo.");
      }
      setShowModal(false);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi khi cập nhật đánh giá: ${error.message}`);
      console.error("Error updating review:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? styles.starFilled : styles.starEmpty}>
          <FaStar />
        </span>
      );
    }
    return <div className={styles.starsContainer}>{stars}</div>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đánh giá</h2>
        <div className={styles.toolsContainer}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}><FaSearch /></span>
            <input
              type="text"
              placeholder="Tìm kiếm đánh giá..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filterBox}>
            <span className={styles.filterIcon}><FaFilter /></span>
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chưa duyệt</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải dữ liệu đánh giá...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}

      {!isLoading && !error && (
        <div className={styles.tableWrapper}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredReviews.length}
            onPageChange={paginate}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[3, 5, 10, 50]}
          />
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã ĐG</th>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>Không có dữ liệu đánh giá</td>
                </tr>
              ) : (
                currentItems.map(review => (
                  <tr key={review.maDG} className={review.anHien ? styles.hiddenRow : ''}>
                    <td className={styles.idCell}>{review.maDG}</td>
                    <td>{review.tenKhachHang || `Khách hàng ${review.maKH}`}</td>
                    <td className={styles.ratingCell}>
                      {renderStars(review.danhGia)}
                    </td>
                    <td className={styles.contentCell}>{review.noiDung}</td>
                    <td className={styles.dateCell}>{review.ngayTao ? new Date(review.ngayTao).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td className={styles.statusCell}>
                      <span className={
                        review.trangThai === 'Đã duyệt' ? styles.approved :
                        review.trangThai === 'Chưa duyệt' ? styles.pending :
                        ''
                      }>
                        {review.trangThai}
                      </span>
                      {review.anHien && <span className={styles.hidden}> (Đã ẩn)</span>}
                    </td>
                    <td className={styles.actionCell}>
                      {review.trangThai !== 'Đã duyệt' && (
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApprove(review.maDG)}
                          title="Duyệt đánh giá"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button
                        className={styles.hideBtn}
                        onClick={() => handleHide(review)}
                        title={review.anHien ? "Hiện đánh giá" : "Ẩn đánh giá"}
                      >
                        {review.anHien ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(review)}
                        title="Sửa đánh giá"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(review.maDG)}
                        title="Xóa đánh giá"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingReview ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="danhGia">Đánh giá (1-5 sao)</label>
                <select
                  id="danhGia"
                  name="danhGia"
                  value={formData.danhGia}
                  onChange={handleChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="1">1 sao</option>
                  <option value="2">2 sao</option>
                  <option value="3">3 sao</option>
                  <option value="4">4 sao</option>
                  <option value="5">5 sao</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="noiDung">Nội dung đánh giá</label>
                <textarea
                  id="noiDung"
                  name="noiDung"
                  value={formData.noiDung}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  rows={4}
                  required
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="trangThai">Trạng thái</label>
                <select
                  id="trangThai"
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  <option value="Chưa duyệt">Chưa duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="anHien"
                    checked={formData.anHien}
                    onChange={(e) => setFormData(prev => ({ ...prev, anHien: e.target.checked }))}
                  />
                  Ẩn đánh giá này
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>Lưu</button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}