'use client';
import React, { useState, useEffect } from "react";
import styles from "./ReviewManager.module.css";
import { getReviews, approveReview, getBookingDetails, getCustomerProfile } from "../../../lib/api";

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

  // Lấy danh sách đánh giá từ API
  useEffect(() => {
    const fetchReviewsAndCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const rawReviewsFromApi: any[] = await getReviews();
        console.log("Raw reviews data from getReviews():", JSON.stringify(rawReviewsFromApi, null, 2));

        const processedReviews = await Promise.all(rawReviewsFromApi.map(async (apiReview) => {
          let tenKhachHangDisplay = 'Khách hàng không xác định';
          let maKhachHangFromBooking: string | undefined = apiReview.maKH; // Ưu tiên maKH trực tiếp từ review nếu có

          if (apiReview.maDatPhong) {
            console.log(`[Review ${apiReview.maReview}] Fetching booking details for MaDatPhong: ${apiReview.maDatPhong}`);
            const bookingData: any = await getBookingDetails(apiReview.maDatPhong);
            console.log(`[Review ${apiReview.maReview}] Booking data for ${apiReview.maDatPhong}:`, JSON.stringify(bookingData, null, 2));

            if (bookingData) {
              // Ưu tiên tên khách hàng trực tiếp từ bookingData nếu có
              const directTenKH = bookingData.tenKhachHang || bookingData.TenKhachHang;
              if (directTenKH && typeof directTenKH === 'string' && directTenKH.trim() !== "") {
                tenKhachHangDisplay = directTenKH;
                console.log(`[Review ${apiReview.maReview}] Found directTenKH from booking: ${directTenKH}`);
              } else {
                 // Nếu không có tên trực tiếp, lấy maKH từ bookingData
                maKhachHangFromBooking = bookingData.maKH || bookingData.MaKH || bookingData.maKhachHang || bookingData.MaKhachHang;
                console.log(`[Review ${apiReview.maReview}] maKhachHangFromBooking from booking: ${maKhachHangFromBooking}`);
              }
            } else {
              console.log(`[Review ${apiReview.maReview}] No bookingData returned or bookingData is null for MaDatPhong: ${apiReview.maDatPhong}`);
            }
          }
          
          // Nếu đã có tên khách hàng từ bookingData, hoặc không có maKhachHangFromBooking, thì không cần fetch customer profile nữa
          if (tenKhachHangDisplay !== 'Khách hàng không xác định' && tenKhachHangDisplay !== `Khách hàng (DP: ${apiReview.maDatPhong})` ) {
            // Đã có tên từ booking, không làm gì thêm
          } else if (maKhachHangFromBooking) {
            console.log(`[Review ${apiReview.maReview}] Fetching customer profile for MaKH: ${maKhachHangFromBooking}`);
            const customerDataWrapper: any = await getCustomerProfile(maKhachHangFromBooking);
            console.log(`[Review ${apiReview.maReview}] Customer data wrapper for ${maKhachHangFromBooking}:`, JSON.stringify(customerDataWrapper, null, 2));
            const customerData = customerDataWrapper?.value || customerDataWrapper;

            if (customerData) {
              // Ưu tiên PascalCase theo comment trong lib/api.ts cho getCustomerProfile
              const hoKh = customerData.HoKh || customerData.hoKh || ''; 
              const tenKh = customerData.TenKh || customerData.tenKh || '';
              if (hoKh || tenKh) {
                tenKhachHangDisplay = `${hoKh} ${tenKh}`.trim();
                console.log(`[Review ${apiReview.maReview}] Constructed customer name: ${tenKhachHangDisplay}`);
              } else if (maKhachHangFromBooking) {
                tenKhachHangDisplay = `Khách hàng (${maKhachHangFromBooking})`; // Fallback nếu không có họ tên
              }
            } else if (maKhachHangFromBooking) {
                 tenKhachHangDisplay = `Khách hàng (${maKhachHangFromBooking})`;
                 console.log(`[Review ${apiReview.maReview}] No customerData found for MaKH: ${maKhachHangFromBooking}, using fallback with MaKH.`);
            } else {
              console.log(`[Review ${apiReview.maReview}] No customerData and no maKhachHangFromBooking to construct name from MaKH.`);
            }
          } else if (apiReview.maDatPhong) {
            // Fallback nếu không lấy được booking hoặc customer
            tenKhachHangDisplay = `Khách hàng (DP: ${apiReview.maDatPhong})`;
          } else {
            console.log(`[Review ${apiReview.maReview}] No MaDatPhong in review and no initial MaKH. Cannot determine customer.`);
          }

          return {
            maDG: apiReview.maReview,
            maDatPhong: apiReview.maDatPhong,
            maKH: maKhachHangFromBooking, // Lưu lại maKH lấy được (nếu có)
            danhGia: apiReview.danhGia,
            noiDung: apiReview.binhLuan,
            ngayTao: apiReview.ngayTao || null,
            trangThai: apiReview.trangThai || 'Chưa duyệt',
            anHien: apiReview.anHien || false,
            tenKhachHang: tenKhachHangDisplay,
          };
        })); // Kết thúc Promise.all(rawReviewsFromApi.map
        
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

  const handleApprove = async (maDG: string) => {
    try {
      await approveReview(maDG, true);
      setReviews(reviews.map(review => 
        review.maDG === maDG ? { ...review, trangThai: 'Đã duyệt' } : review
      ));
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
      
      // Gọi API cập nhật đánh giá (tùy thuộc vào backend)
      // Điều này sẽ phụ thuộc vào cách API của bạn xử lý việc ẩn/hiện đánh giá
      // await updateReview(updatedReview);
      
      // Cập nhật state
      setReviews(reviews.map(r => 
        r.maDG === review.maDG ? updatedReview : r
      ));
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
        // API xóa đánh giá (cần thêm vào API.ts)
        // await deleteReview(maDG);
        
        // Cập nhật state
        setReviews(reviews.filter(review => review.maDG !== maDG));
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
        // Cập nhật đánh giá
        // await updateReview(formData);
        
        setReviews(reviews.map(review => 
          review.maDG === editingReview.maDG ? { ...review, ...formData } : review
        ));
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đánh giá</h2>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải dữ liệu đánh giá...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
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
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{textAlign: 'center', padding: '16px'}}>Không có dữ liệu đánh giá</td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.maDG}>
                    <td>{review.maDG}</td>
                    <td>{review.tenKhachHang || `Khách hàng ${review.maKH}`}</td>
                    <td className={styles.rating}>
                      {'★'.repeat(review.danhGia)}{'☆'.repeat(5 - review.danhGia)}
                    </td>
                    <td>{review.noiDung}</td>
                    <td>{review.ngayTao ? new Date(review.ngayTao).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>
                      <span className={
                        review.trangThai === 'Đã duyệt' ? styles.approved :
                        review.trangThai === 'Chưa duyệt' ? styles.pending :
                        ''
                      }>
                        {review.trangThai}
                      </span>
                      {review.anHien && <span className={styles.hidden}> (Đã ẩn)</span>}
                    </td>
                    <td>
                      {review.trangThai !== 'Đã duyệt' && (
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApprove(review.maDG)}
                        >
                          Duyệt
                        </button>
                      )}
                      <button
                        className={styles.hideBtn}
                        onClick={() => handleHide(review)}
                      >
                        {review.anHien ? 'Hiện' : 'Ẩn'}
                      </button>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(review)}
                      >
                        Sửa
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(review.maDG)}
                      >
                        Xóa
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
              <div>
                <label>Khách hàng:</label>
                <input
                  type="text"
                  name="tenKhachHang"
                  value={formData.tenKhachHang || ''}
                  onChange={handleInputChange}
                  required
                  readOnly={true}
                />
              </div>
              <div>
                <label>Đánh giá:</label>
                <select
                  name="danhGia"
                  value={formData.danhGia}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'sao' : 'sao'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Nội dung:</label>
                <textarea
                  name="noiDung"
                  value={formData.noiDung || ''}
                  onChange={handleInputChange}
                  rows={5}
                  required
                ></textarea>
              </div>
              <div>
                <label>Trạng thái:</label>
                <select
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={handleInputChange}
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