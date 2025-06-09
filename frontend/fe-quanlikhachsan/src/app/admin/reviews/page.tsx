'use client';
import React, { useState, useEffect } from "react";
import styles from "./ReviewManager.module.css";
import { getReviews, approveReview, getBookingDetails } from "../../../lib/api";
import { FaSearch, FaFilter, FaStar, FaCheck, FaEye, FaEyeSlash, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

interface Review {
  maDG: string;
  maKH?: string;
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

  // Lấy danh sách đánh giá từ API
  useEffect(() => {
    const fetchReviewsAndCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const rawReviewsFromApi: any[] = await getReviews();
        console.log("Raw reviews data from getReviews():", JSON.stringify(rawReviewsFromApi, null, 2));

        const processedReviews = await Promise.all(rawReviewsFromApi.map(async (apiReview) => {
          const tenKhachHangDisplay = 'Khách hàng không xác định';
          const maKhachHangFromBooking: string | undefined = apiReview.maKH;

          const reviewId = apiReview.MaReview || apiReview.maReview;
          const datPhongId = apiReview.MaDatPhong || apiReview.maDatPhong;

          if (datPhongId) {
            console.log(`[Review ${reviewId}] Fetching booking details for MaDatPhong: ${datPhongId}`);
            const bookingData: any = await getBookingDetails(datPhongId);
            console.log(`[Review ${reviewId}] Booking data for ${datPhongId}:`, JSON.stringify(bookingData, null, 2));
          }

          return {
            maDG: apiReview.MaReview || apiReview.maReview,
            maDatPhong: apiReview.MaDatPhong || apiReview.maDatPhong,
            maKH: maKhachHangFromBooking,
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

    fetchReviewsAndCustomers();
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
    if (filterStatus === 'hidden') return matchesSearch && review.anHien;
    
    return matchesSearch;
  });

  const handleApprove = async (maDG: string) => {
    try {
      // Tạm thời comment out API call vì backend chưa có endpoint này
      // await approveReview(maDG, true);

      // Cập nhật state trực tiếp (mock approval)
      setReviews(reviews.map(review =>
        review.maDG === maDG ? { ...review, trangThai: 'Đã duyệt' } : review
      ));

      console.log(`Mock approved review ${maDG}`);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi khi duyệt đánh giá: ${error.message}`);
      console.error("Error approving review:", error);
    }
  };

  const handleHide = async (review: Review) => {
    try {
      // Tạo đối tượng để cập nhật trạng thái ẩn/hiện
      const updatedReview = {
        ...review,
        anHien: !review.anHien
      };

      // Tạm thời comment out API call vì backend chưa có endpoint này
      // await updateReview(updatedReview);

      // Cập nhật state trực tiếp (mock hide/show)
      setReviews(reviews.map(r =>
        r.maDG === review.maDG ? updatedReview : r
      ));

      console.log(`Mock ${updatedReview.anHien ? 'hidden' : 'shown'} review ${review.maDG}`);
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
        // Tạm thời comment out API call vì backend chưa có endpoint này
        // await deleteReview(maDG);

        // Cập nhật state trực tiếp (mock delete)
        setReviews(reviews.filter(review => review.maDG !== maDG));
        console.log(`Mock deleted review ${maDG}`);
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
        // Tạm thời comment out API call vì backend chưa có endpoint này
        // await updateReview(formData);

        // Cập nhật state trực tiếp (mock update)
        setReviews(reviews.map(review =>
          review.maDG === editingReview.maDG ? { ...review, ...formData } : review
        ));
        console.log(`Mock updated review ${editingReview.maDG}`, formData);
      } else {
        // Thêm đánh giá mới (thường không cần thiết vì đánh giá do khách hàng tạo)
        alert("Chức năng thêm đánh giá không được hỗ trợ. Đánh giá thường do khách hàng tạo.");
      }
      setShowModal(false);
      setEditingReview(null);
      setFormData({
        tenKhachHang: '',
        danhGia: 5,
        noiDung: '',
        trangThai: 'Chưa duyệt',
        anHien: false
      });
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error updating review:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar 
            key={star} 
            className={star <= rating ? styles.starFilled : styles.starEmpty} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đánh giá</h2>
        <div className={styles.toolsContainer}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Tìm kiếm đánh giá..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterBox}>
            <FaFilter className={styles.filterIcon} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
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
                filteredReviews.map(review => (
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
            <h3>{editingReview ? 'Sửa đánh giá' : 'Thêm đánh giá'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Khách hàng:</label>
                <input
                  type="text"
                  name="tenKhachHang"
                  value={formData.tenKhachHang || ''}
                  onChange={handleInputChange}
                  required
                  readOnly={true}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Đánh giá:</label>
                <div className={styles.ratingSelector}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <FaStar
                      key={star}
                      className={star <= (formData.danhGia || 0) ? styles.starSelectFilled : styles.starSelectEmpty}
                      onClick={() => setFormData({...formData, danhGia: star})}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Nội dung:</label>
                <textarea
                  name="noiDung"
                  value={formData.noiDung || ''}
                  onChange={handleInputChange}
                  rows={5}
                  required
                  className={styles.formTextarea}
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>Trạng thái:</label>
                <select
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="Chưa duyệt">Chưa duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                </select>
              </div>
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="anHien"
                    checked={formData.anHien}
                    onChange={handleInputChange}
                  />
                  Ẩn đánh giá này
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  {editingReview ? 'Lưu thay đổi' : 'Thêm đánh giá'}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowModal(false);
                    setEditingReview(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
