  'use client';
import React, { useState, useEffect } from "react";
import styles from "./BookingManager.module.css";
import { API_BASE_URL } from '../../../lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '../../../lib/api';

interface Booking {
  maDatPhong: string;
  maKh: string;
  tenKhachHang?: string;
  maPhong: string;
  tenPhong?: string;
  ngayDen: string;
  ngayDi: string;
  trangThai: string;
  ghiChu?: string;
  tongTien?: number;
}

const statusMap: Record<string, { label: string; className: string }> = {
  "Đã đặt": { label: "Đã đặt", className: styles["status"] + " " + styles["status-booked"] },
  "Đã nhận phòng": { label: "Đã nhận phòng", className: styles["status"] + " " + styles["status-checkedin"] },
  "Đã trả phòng": { label: "Đã trả phòng", className: styles["status"] + " " + styles["status-checkedout"] },
  "Đã hủy": { label: "Đã hủy", className: styles["status"] + " " + styles["status-cancelled"] },
  "Chờ thanh toán": { label: "Chờ thanh toán", className: styles["status"] + " " + styles["status-pending"] },
};

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<Booking>({ 
    maDatPhong: "", 
    maKh: "", 
    maPhong: "", 
    ngayDen: "", 
    ngayDi: "", 
    trangThai: "" 
  });
  const [historyBooking, setHistoryBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<{maKh: string, hoKh: string, tenKh: string}[]>([]);
  const [rooms, setRooms] = useState<{maPhong: string, tenPhong: string}[]>([]);

  // Lấy dữ liệu đặt phòng, khách hàng và phòng từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để xem dữ liệu");
        
        // Lấy danh sách đặt phòng
        const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        // Lấy danh sách khách hàng
        const customersResponse = await fetch(`${API_BASE_URL}/KhachHang/Lấy danh sách tất cả khách hàng`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        // Lấy danh sách phòng
        const roomsResponse = await fetch(`${API_BASE_URL}/Phong/Lấy danh sách tất cả phòng`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        // Xử lý dữ liệu
        const bookingsData = await handleResponse(bookingsResponse);
        const customersData = await handleResponse(customersResponse);
        const roomsData = await handleResponse(roomsResponse);
        
        // Đảm bảo dữ liệu là mảng
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
        const customersArray = Array.isArray(customersData) ? customersData : [];
        const roomsArray = Array.isArray(roomsData) ? roomsData : [];
        
        setCustomers(customersArray);
        setRooms(roomsArray);
        
        // Kết hợp thông tin tên khách hàng và tên phòng vào đặt phòng
        const bookingsWithDetails = bookingsArray.map((booking: Booking) => {
          const customer = customersArray.find(c => c.maKh === booking.maKh);
          const room = roomsArray.find(r => r.maPhong === booking.maPhong);
          
          return {
            ...booking,
            tenKhachHang: customer ? `${customer.hoKh} ${customer.tenKh}` : 'Không xác định',
            tenPhong: room?.tenPhong || 'Không xác định',
            tongTien: booking.tongTien || 0
          };
        });
        
        setBookings(bookingsWithDetails);
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

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Format ngày cho input date
  const formatDateForInput = (dateString: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Khi mở modal Thêm mới
  const openAddModal = () => {
    setForm({ 
      maDatPhong: "", 
      maKh: "", 
      maPhong: "", 
      ngayDen: new Date().toISOString().split('T')[0], 
      ngayDi: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
      trangThai: "Đã đặt" 
    });
    setShowAddModal(true);
  };

  // Khi mở modal Sửa
  const openEditModal = (booking: Booking) => {
    setForm({
      ...booking,
      ngayDen: formatDateForInput(booking.ngayDen),
      ngayDi: formatDateForInput(booking.ngayDi)
    });
    setEditBooking(booking);
  };

  // Xử lý thay đổi input
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (data: Booking): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Kiểm tra khách hàng
    if (!data.maKh) {
      errors.maKh = 'Vui lòng chọn khách hàng';
    }

    // Kiểm tra phòng
    if (!data.maPhong) {
      errors.maPhong = 'Vui lòng chọn phòng';
    }

    // Kiểm tra ngày nhận phòng
    if (!data.ngayDen) {
      errors.ngayDen = 'Vui lòng chọn ngày nhận phòng';
    } else {
      const ngayDen = new Date(data.ngayDen);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (ngayDen < today) {
        errors.ngayDen = 'Ngày nhận phòng không thể là ngày trong quá khứ';
      }
    }

    // Kiểm tra ngày trả phòng
    if (!data.ngayDi) {
      errors.ngayDi = 'Vui lòng chọn ngày trả phòng';
    } else if (data.ngayDen) {
      const ngayDen = new Date(data.ngayDen);
      const ngayDi = new Date(data.ngayDi);
      if (ngayDi <= ngayDen) {
        errors.ngayDi = 'Ngày trả phòng phải sau ngày nhận phòng';
      }
    }

    // Kiểm tra trạng thái
    if (!data.trangThai) {
      errors.trangThai = 'Vui lòng chọn trạng thái';
    }

    // Kiểm tra ghi chú
    if (data.ghiChu && data.ghiChu.length > 500) {
      errors.ghiChu = 'Ghi chú không được vượt quá 500 ký tự';
    }

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    // Kiểm tra realtime cho trường đang thay đổi
    const errors = validateForm(newForm);
    setFormErrors(prev => ({
      ...prev,
      [name]: errors[name] || ''
    }));
  };

  // Xử lý submit Thêm mới
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra toàn bộ form trước khi submit
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      for (const key in form) {
        if (key !== 'tenKhachHang' && key !== 'tenPhong' && key !== 'maDatPhong' && key !== 'tongTien') {
          formData.append(key, String(form[key as keyof Booking] || ''));
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/DatPhong/Tạo đặt phòng mới`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Lấy lại danh sách đặt phòng
      const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      
      const bookingsData = await handleResponse(bookingsResponse);
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      
      // Kết hợp lại thông tin
      const bookingsWithDetails = bookingsArray.map((booking: Booking) => {
        const customer = customers.find(c => c.maKh === booking.maKh);
        const room = rooms.find(r => r.maPhong === booking.maPhong);
        
        return {
          ...booking,
          tenKhachHang: customer ? `${customer.hoKh} ${customer.tenKh}` : 'Không xác định',
          tenPhong: room?.tenPhong || 'Không xác định',
          tongTien: booking.tongTien || 0
        };
      });
      
      setBookings(bookingsWithDetails);
      setShowAddModal(false);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error adding booking:", error);
    }
  };

  // Xử lý submit Sửa
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      for (const key in form) {
        if (key !== 'tenKhachHang' && key !== 'tenPhong') {
          formData.append(key, String(form[key as keyof Booking] || ''));
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/DatPhong/Cập nhật đặt phòng?maDatPhong=${form.maDatPhong}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Lấy lại danh sách đặt phòng
      const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      
      const bookingsData = await handleResponse(bookingsResponse);
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      
      // Kết hợp lại thông tin
      const bookingsWithDetails = bookingsArray.map((booking: Booking) => {
        const customer = customers.find(c => c.maKh === booking.maKh);
        const room = rooms.find(r => r.maPhong === booking.maPhong);
        
        return {
          ...booking,
          tenKhachHang: customer ? `${customer.hoKh} ${customer.tenKh}` : 'Không xác định',
          tenPhong: room?.tenPhong || 'Không xác định',
          tongTien: booking.tongTien || 0
        };
      });
      
      setBookings(bookingsWithDetails);
      setEditBooking(null);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error updating booking:", error);
    }
  };

  // Lọc theo search
  const filtered = bookings.filter(b =>
    (b.tenKhachHang || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.tenPhong || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.maDatPhong || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đặt phòng</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <input
            className={styles.search}
            type="text"
            placeholder="Tìm kiếm khách/phòng/mã đặt phòng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={styles.addBtn} onClick={openAddModal}>+ Thêm đặt phòng</button>
        </div>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
      <div style={{overflowX:'auto'}}>
      <table className={styles.table}>
        <thead>
          <tr>
                <th>Mã đặt phòng</th>
            <th>Khách hàng</th>
            <th>Phòng</th>
            <th>Nhận phòng</th>
            <th>Trả phòng</th>
                <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu</td></tr>
          ) : filtered.map(booking => (
                <tr key={booking.maDatPhong}>
                  <td>{booking.maDatPhong}</td>
                  <td>{booking.tenKhachHang}</td>
                  <td>{booking.tenPhong}</td>
                  <td>{formatDate(booking.ngayDen)}</td>
                  <td>{formatDate(booking.ngayDi)}</td>
                  <td>{(booking.tongTien || 0).toLocaleString()} đ</td>
                  <td><span className={statusMap[booking.trangThai]?.className || styles.status}>{statusMap[booking.trangThai]?.label || booking.trangThai}</span></td>
              <td style={{whiteSpace:'nowrap'}}>
                <button className={styles.editBtn} onClick={() => openEditModal(booking)}>Sửa</button>
                    <button className={styles.historyBtn} onClick={() => setHistoryBooking(booking)}>Chi tiết</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      )}

      {/* Modal Thêm mới */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Thêm đặt phòng</h3>
            <form onSubmit={handleAdd} autoComplete="off">
              <div>
                <label>Khách hàng:</label>
                <select 
                  name="maKh" 
                  value={form.maKh} 
                  onChange={handleChange} 
                  required
                  className={formErrors.maKh ? styles.errorInput : ''}
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.maKh} value={customer.maKh}>
                      {customer.hoKh} {customer.tenKh}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Phòng:</label>
                <select 
                  name="maPhong" 
                  value={form.maPhong} 
                  onChange={handleChange} 
                  required
                  className={formErrors.maPhong ? styles.errorInput : ''}
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map(room => (
                    <option key={room.maPhong} value={room.maPhong}>
                      {room.tenPhong}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Ngày nhận phòng:</label>
                <input 
                  name="ngayDen" 
                  type="date" 
                  value={form.ngayDen} 
                  onChange={handleChange} 
                  required
                  className={formErrors.ngayDen ? styles.errorInput : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.ngayDen && <p className={styles.errorText}>{formErrors.ngayDen}</p>}
              </div>
              <div>
                <label>Ngày trả phòng:</label>
                <input 
                  name="ngayDi" 
                  type="date" 
                  value={form.ngayDi} 
                  onChange={handleChange} 
                  required
                  className={formErrors.ngayDi ? styles.errorInput : ''}
                  min={form.ngayDen || new Date().toISOString().split('T')[0]}
                />
                {formErrors.ngayDi && <p className={styles.errorText}>{formErrors.ngayDi}</p>}
              </div>
              <div>
                <label>Trạng thái:</label>
                <select 
                  name="trangThai" 
                  value={form.trangThai} 
                  onChange={handleChange} 
                  required
                  className={formErrors.trangThai ? styles.errorInput : ''}
                >
                <option value="">Chọn trạng thái</option>
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đã nhận phòng">Đã nhận phòng</option>
                <option value="Đã trả phòng">Đã trả phòng</option>
                  <option value="Đã hủy">Đã hủy</option>
                  <option value="Chờ thanh toán">Chờ thanh toán</option>
              </select>
              </div>
              <div>
                <label>Ghi chú:</label>
                <textarea 
                  name="ghiChu" 
                  value={form.ghiChu || ''} 
                  onChange={handleChange} 
                  rows={3}
                  maxLength={500}
                  className={formErrors.ghiChu ? styles.errorInput : ''}
                  placeholder="Nhập ghi chú (tối đa 500 ký tự)"
                />
                {formErrors.ghiChu && <p className={styles.errorText}>{formErrors.ghiChu}</p>}
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {editBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa đặt phòng</h3>
            <form onSubmit={handleEdit} autoComplete="off">
              <div>
                <label>Mã đặt phòng:</label>
                <input name="maDatPhong" value={form.maDatPhong} disabled />
              </div>
              <div>
                <label>Khách hàng:</label>
                <select 
                  name="maKh" 
                  value={form.maKh} 
                  onChange={handleChange} 
                  required
                  className={formErrors.maKh ? styles.errorInput : ''}
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.maKh} value={customer.maKh}>
                      {customer.hoKh} {customer.tenKh}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Phòng:</label>
                <select 
                  name="maPhong" 
                  value={form.maPhong} 
                  onChange={handleChange} 
                  required
                  className={formErrors.maPhong ? styles.errorInput : ''}
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map(room => (
                    <option key={room.maPhong} value={room.maPhong}>
                      {room.tenPhong}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Ngày nhận phòng:</label>
                <input 
                  name="ngayDen" 
                  type="date" 
                  value={form.ngayDen} 
                  onChange={handleChange} 
                  required
                  className={formErrors.ngayDen ? styles.errorInput : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.ngayDen && <p className={styles.errorText}>{formErrors.ngayDen}</p>}
              </div>
              <div>
                <label>Ngày trả phòng:</label>
                <input 
                  name="ngayDi" 
                  type="date" 
                  value={form.ngayDi} 
                  onChange={handleChange} 
                  required
                  className={formErrors.ngayDi ? styles.errorInput : ''}
                  min={form.ngayDen || new Date().toISOString().split('T')[0]}
                />
                {formErrors.ngayDi && <p className={styles.errorText}>{formErrors.ngayDi}</p>}
              </div>
              <div>
                <label>Trạng thái:</label>
                <select 
                  name="trangThai" 
                  value={form.trangThai} 
                  onChange={handleChange} 
                  required
                  className={formErrors.trangThai ? styles.errorInput : ''}
                >
                <option value="">Chọn trạng thái</option>
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đã nhận phòng">Đã nhận phòng</option>
                <option value="Đã trả phòng">Đã trả phòng</option>
                  <option value="Đã hủy">Đã hủy</option>
                  <option value="Chờ thanh toán">Chờ thanh toán</option>
              </select>
              </div>
              <div>
                <label>Ghi chú:</label>
                <textarea 
                  name="ghiChu" 
                  value={form.ghiChu || ''} 
                  onChange={handleChange} 
                  rows={3}
                  maxLength={500}
                  className={formErrors.ghiChu ? styles.errorInput : ''}
                  placeholder="Nhập ghi chú (tối đa 500 ký tự)"
                />
                {formErrors.ghiChu && <p className={styles.errorText}>{formErrors.ghiChu}</p>}
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setEditBooking(null)} className={styles.cancelBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết */}
      {historyBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Chi tiết đặt phòng</h3>
            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mã đặt phòng:</span>
                <span className={styles.detailValue}>{historyBooking.maDatPhong}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Khách hàng:</span>
                <span className={styles.detailValue}>{historyBooking.tenKhachHang}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phòng:</span>
                <span className={styles.detailValue}>{historyBooking.tenPhong}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nhận phòng:</span>
                <span className={styles.detailValue}>{formatDate(historyBooking.ngayDen)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Trả phòng:</span>
                <span className={styles.detailValue}>{formatDate(historyBooking.ngayDi)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tổng tiền:</span>
                <span className={styles.detailValue}>{(historyBooking.tongTien || 0).toLocaleString()} đ</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Trạng thái:</span>
                <span className={styles.detailValue}>
                  <span className={statusMap[historyBooking.trangThai]?.className || styles.status}>
                    {statusMap[historyBooking.trangThai]?.label || historyBooking.trangThai}
                  </span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ghi chú:</span>
                <span className={styles.detailValue}>{historyBooking.ghiChu || '(Không có)'}</span>
              </div>
            </div>
            <div className={styles.buttonGroup}>
            <button onClick={() => setHistoryBooking(null)} className={styles.editBtn}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 