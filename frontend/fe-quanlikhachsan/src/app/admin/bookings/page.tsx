'use client';
import React, { useState, useEffect } from "react";
import styles from "./BookingManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '@/lib/api';

// Interface cho dữ liệu Đặt phòng từ BE (PascalCase)
interface BookingBE {
  MaDatPhong: string;
  MaKH: string;
  NgayNhanPhong: string;
  NgayTraPhong: string;
  TrangThai: string;
  GhiChu?: string;
  TreEm?: number;
  NguoiLon?: number;
  SoLuongPhong?: number;
  ThoiGianDen?: string;
  // DatPhongDTO không có MaPhong, TongTien
}

// Interface để hiển thị trong bảng, có thể kết hợp thêm thông tin
interface BookingDisplay extends BookingBE {
  tenKhachHang?: string;
  tenPhongDisplay?: string; // Sẽ luôn là 'N/A' vì DatPhongDTO không có chi tiết phòng
  tongTienDisplay?: string; // Sẽ luôn là 'N/A' vì DatPhongDTO không có tổng tiền
}

// Interface cho state của form (PascalCase, khớp với Create/Update DTOs)
// Lưu ý: CreateDatPhongDTO và UpdateDatPhongDTO có các trường khác nhau
interface BookingFormState {
  MaKH: string; // Bắt buộc khi thêm
  NgayNhanPhong: string;
  NgayTraPhong: string;
  GhiChu?: string;
  TreEm?: number;
  NguoiLon?: number;
  SoLuongPhong?: number;
  ThoiGianDen?: string;
  TrangThai?: string; // Chỉ dùng khi sửa và nếu BE cho phép sửa trạng thái qua endpoint này
  // MaPhong không có trong CreateDatPhongDTO
}

const statusMap: Record<string, { label: string; className: string }> = {
  "Đã đặt": { label: "Đã đặt", className: styles["status"] + " " + styles["status-booked"] },
  "Đã nhận phòng": { label: "Đã nhận phòng", className: styles["status"] + " " + styles["status-checkedin"] },
  "Đã trả phòng": { label: "Đã trả phòng", className: styles["status"] + " " + styles["status-checkedout"] },
  "Đã hủy": { label: "Đã hủy", className: styles["status"] + " " + styles["status-cancelled"] },
  "Chờ thanh toán": { label: "Chờ thanh toán", className: styles["status"] + " " + styles["status-pending"] },
  "Hoàn thành": { label: "Hoàn thành", className: styles["status"] + " " + styles["status-completed"] }, // Ví dụ thêm trạng thái
};

export default function BookingManager() {
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBooking, setEditBooking] = useState<BookingDisplay | null>(null);
  const [form, setForm] = useState<BookingFormState>({
    MaKH: "",
    NgayNhanPhong: "",
    NgayTraPhong: "",
    TrangThai: "Đã đặt", // Mặc định khi thêm, nhưng không gửi nếu CreateDTO không có
    GhiChu: "",
    TreEm: 0,
    NguoiLon: 1,
    SoLuongPhong: 1,
    ThoiGianDen: "14:00"
  });
  const [historyBooking, setHistoryBooking] = useState<BookingDisplay | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<{MaKh: string, hoKh: string, tenKh: string}[]>([]);
  // const [rooms, setRooms] = useState<{MaPhong: string, SoPhong: string}[]>([]); // Không dùng rooms trong form này nữa vì DTO không có MaPhong

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Lấy danh sách đặt phòng
        const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        // Lấy danh sách khách hàng
        const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        const bookingsData = await handleResponse(bookingsResponse);
        const customersData = await handleResponse(customersResponse);
        
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
        const customersArray = Array.isArray(customersData) ? customersData : [];
        
        // Lưu trữ customers để dùng trong select options
        setCustomers(customersArray.map((c: any) => ({ MaKh: c.MaKh, hoKh: c.HoKh, tenKh: c.TenKh })));
        
        const bookingsWithDetails = bookingsArray.map((apiBooking: BookingBE): BookingDisplay => {
          const customer = customersArray.find((c: any) => c.MaKh === apiBooking.MaKH);
          
          return {
            ...apiBooking, // Spread tất cả các trường từ BookingBE (PascalCase)
            tenKhachHang: customer ? `${customer.HoKh} ${customer.TenKh}` : 'Không xác định',
            tenPhongDisplay: 'N/A', 
            tongTienDisplay: 'N/A',
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

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Trả về chuỗi gốc nếu không parse được
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Thử parse định dạng dd/MM/yyyy nếu có
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; 
          const year = parseInt(parts[2], 10);
          date = new Date(year, month, day);
        }
        if (isNaN(date.getTime())) {
          return ''; 
        }
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date for input:", dateString, error);
      return '';
    }
  };

  const openAddModal = () => {
    setForm({
      MaKH: "",
      NgayNhanPhong: formatDateForInput(new Date().toISOString()),
      NgayTraPhong: formatDateForInput(new Date(Date.now() + 86400000).toISOString()), // +1 day
      // TrangThai không nằm trong CreateDatPhongDTO
      GhiChu: "",
      TreEm: 0,
      NguoiLon: 1,
      SoLuongPhong: 1,
      ThoiGianDen: "14:00"
    });
    setEditBooking(null);
    setShowAddModal(true);
  };

  const openEditModal = (booking: BookingDisplay) => {
    setForm({
      MaKH: booking.MaKH, // UpdateDatPhongDTO không có MaKH, nhưng có thể cần để hiển thị
      NgayNhanPhong: formatDateForInput(booking.NgayNhanPhong),
      NgayTraPhong: formatDateForInput(booking.NgayTraPhong),
      TrangThai: booking.TrangThai, // Form có thể có trạng thái, nhưng UpdateDTO không có.
      GhiChu: booking.GhiChu || "",
      TreEm: booking.TreEm !== undefined ? booking.TreEm : 0,
      NguoiLon: booking.NguoiLon !== undefined ? booking.NguoiLon : 1,
      SoLuongPhong: booking.SoLuongPhong !== undefined ? booking.SoLuongPhong : 1,
      ThoiGianDen: booking.ThoiGianDen || "14:00",
    });
    setEditBooking(booking);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: (name === 'TreEm' || name === 'NguoiLon' || name === 'SoLuongPhong') && value !== '' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    
    // Các trường cho CreateDatPhongDTO (PascalCase)
    if (!editBooking) { // Logic cho Thêm mới
      formData.append('MaKH', form.MaKH);
      formData.append('NgayNhanPhong', form.NgayNhanPhong);
      formData.append('NgayTraPhong', form.NgayTraPhong);
      if (form.GhiChu) formData.append('GhiChu', form.GhiChu);
      formData.append('TreEm', String(form.TreEm || 0));
      formData.append('NguoiLon', String(form.NguoiLon || 1));
      formData.append('SoLuongPhong', String(form.SoLuongPhong || 1));
      if (form.ThoiGianDen) formData.append('ThoiGianDen', form.ThoiGianDen);
      // TrangThai không được gửi khi thêm mới theo CreateDatPhongDTO
    }

    // Các trường cho UpdateDatPhongDTO (PascalCase) - KHÔNG BAO GỒM MaKH, TrangThai
    if (editBooking) { // Logic cho Sửa
      // MaKH không được cập nhật
      if (form.NgayNhanPhong) formData.append('NgayNhanPhong', form.NgayNhanPhong);
      if (form.NgayTraPhong) formData.append('NgayTraPhong', form.NgayTraPhong);
      if (form.GhiChu) formData.append('GhiChu', form.GhiChu);
      formData.append('TreEm', String(form.TreEm || 0));
      formData.append('NguoiLon', String(form.NguoiLon || 1));
      formData.append('SoLuongPhong', String(form.SoLuongPhong || 1));
      if (form.ThoiGianDen) formData.append('ThoiGianDen', form.ThoiGianDen);
      // TrangThai không được cập nhật qua endpoint này theo UpdateDatPhongDTO
    }

    try {
      let response;
      const endpoint = editBooking 
        ? `${API_BASE_URL}/DatPhong/${editBooking.MaDatPhong}` 
        : `${API_BASE_URL}/DatPhong`;
      const method = editBooking ? 'PUT' : 'POST';

      response = await fetch(endpoint, {
        method: method,
        headers: getFormDataHeaders(), // FormData nên không cần Content-Type: application/json
        body: formData,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Tải lại dữ liệu sau khi thêm/sửa thành công
      const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, { headers: getAuthHeaders('GET'), credentials: 'include' });
      const bookingsData = await handleResponse(bookingsResponse);
      const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, { headers: getAuthHeaders('GET'), credentials: 'include' });
      const customersData = await handleResponse(customersResponse);

      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      const customersArray = Array.isArray(customersData) ? customersData : [];
      
      setCustomers(customersArray.map((c: any) => ({ MaKh: c.MaKh, hoKh: c.HoKh, tenKh: c.TenKh })));
      
      const bookingsWithDetails = bookingsArray.map((apiBooking: BookingBE): BookingDisplay => {
        const customer = customersArray.find((c: any) => c.MaKh === apiBooking.MaKH);
        return {
          ...apiBooking,
          tenKhachHang: customer ? `${customer.HoKh} ${customer.TenKh}` : 'Không xác định',
          tenPhongDisplay: 'N/A',
          tongTienDisplay: 'N/A',
        };
      });
      setBookings(bookingsWithDetails);

      if (editBooking) {
        setEditBooking(null);
      } else {
        setShowAddModal(false);
      }
      alert(editBooking ? "Cập nhật đặt phòng thành công!" : "Thêm đặt phòng thành công!");

    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error(`Error ${editBooking ? 'updating' : 'adding'} booking:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = bookings.filter(b =>
    (b.tenKhachHang || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.MaDatPhong || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.MaKH || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đặt phòng</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <input
            className={styles.search}
            type="text"
            placeholder="Tìm kiếm khách/mã đặt phòng..."
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
            <tr key={booking.MaDatPhong}>
              <td>{booking.MaDatPhong}</td>
              <td>{booking.tenKhachHang || booking.MaKH}</td>
              <td>{booking.tenPhongDisplay}</td> 
              <td>{formatDate(booking.NgayNhanPhong)}</td>
              <td>{formatDate(booking.NgayTraPhong)}</td>
              <td>{booking.tongTienDisplay}</td>
              <td><span className={statusMap[booking.TrangThai]?.className || styles.status}>{statusMap[booking.TrangThai]?.label || booking.TrangThai}</span></td>
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
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.formGroup}>
                <label htmlFor="MaKH">Khách hàng</label>
                <select id="MaKH" name="MaKH" value={form.MaKH} onChange={handleChange} required>
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.MaKh} value={customer.MaKh}>{customer.hoKh} {customer.tenKh} ({customer.MaKh})</option>
                  ))}
                </select>
              </div>
              {/* Bỏ chọn phòng vì DTO không có MaPhong */}
              <div className={styles.formGroup}>
                <label htmlFor="NgayNhanPhong">Ngày đến</label>
                <input type="date" id="NgayNhanPhong" name="NgayNhanPhong" value={form.NgayNhanPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="NgayTraPhong">Ngày đi</label>
                <input type="date" id="NgayTraPhong" name="NgayTraPhong" value={form.NgayTraPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ThoiGianDen">Thời gian đến dự kiến</label>
                <input type="text" id="ThoiGianDen" name="ThoiGianDen" value={form.ThoiGianDen || ""} onChange={handleChange} placeholder="HH:mm" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="NguoiLon">Số người lớn</label>
                <input type="number" id="NguoiLon" name="NguoiLon" value={form.NguoiLon || 0} onChange={handleChange} min="1" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="TreEm">Số trẻ em</label>
                <input type="number" id="TreEm" name="TreEm" value={form.TreEm || 0} onChange={handleChange} min="0" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="SoLuongPhong">Số lượng phòng</label> {/* CreateDatPhongDTO có SoLuongPhong */}
                <input type="number" id="SoLuongPhong" name="SoLuongPhong" value={form.SoLuongPhong || 0} onChange={handleChange} min="1" />
              </div>
               <div className={styles.formGroup}>
                <label htmlFor="GhiChu">Ghi chú</label>
                <textarea id="GhiChu" name="GhiChu" value={form.GhiChu || ""} onChange={handleChange} rows={3} />
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn} disabled={isLoading}>Lưu</button>
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
            <h3>Sửa đặt phòng - Mã: {editBooking.MaDatPhong}</h3>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.formGroup}>
                <label htmlFor="MaKH_edit">Khách hàng (Không thể sửa)</label>
                <input id="MaKH_edit" name="MaKH_edit" value={`${editBooking.tenKhachHang} (${editBooking.MaKH})`} disabled />
              </div>
              {/* Bỏ chọn phòng vì DTO không có MaPhong */}
              <div className={styles.formGroup}>
                <label htmlFor="NgayNhanPhong_edit">Ngày đến</label>
                <input type="date" id="NgayNhanPhong_edit" name="NgayNhanPhong" value={form.NgayNhanPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="NgayTraPhong_edit">Ngày đi</label>
                <input type="date" id="NgayTraPhong_edit" name="NgayTraPhong" value={form.NgayTraPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ThoiGianDen_edit">Thời gian đến dự kiến</label>
                <input type="text" id="ThoiGianDen_edit" name="ThoiGianDen" value={form.ThoiGianDen || ""} onChange={handleChange} placeholder="HH:mm" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="NguoiLon_edit">Số người lớn</label>
                <input type="number" id="NguoiLon_edit" name="NguoiLon" value={form.NguoiLon || 0} onChange={handleChange} min="1" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="TreEm_edit">Số trẻ em</label>
                <input type="number" id="TreEm_edit" name="TreEm" value={form.TreEm || 0} onChange={handleChange} min="0" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="SoLuongPhong_edit">Số lượng phòng</label> {/* UpdateDatPhongDTO có SoLuongPhong */}
                <input type="number" id="SoLuongPhong_edit" name="SoLuongPhong" value={form.SoLuongPhong || 0} onChange={handleChange} min="1" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="GhiChu_edit">Ghi chú</label>
                <textarea id="GhiChu_edit" name="GhiChu" value={form.GhiChu || ""} onChange={handleChange} rows={3} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="TrangThai_edit">Trạng thái (Chỉ hiển thị - Không sửa qua form này)</label>
                <select id="TrangThai_edit" name="TrangThai" value={form.TrangThai} onChange={handleChange} disabled>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn} disabled={isLoading}>Lưu thay đổi</button>
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
                <span className={styles.detailValue}>{historyBooking.MaDatPhong}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Khách hàng:</span>
                <span className={styles.detailValue}>{historyBooking.tenKhachHang || historyBooking.MaKH}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phòng:</span>
                <span className={styles.detailValue}>{historyBooking.tenPhongDisplay}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nhận phòng:</span>
                <span className={styles.detailValue}>{formatDate(historyBooking.NgayNhanPhong)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Trả phòng:</span>
                <span className={styles.detailValue}>{formatDate(historyBooking.NgayTraPhong)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Số người lớn:</span>
                <span className={styles.detailValue}>{historyBooking.NguoiLon}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Số trẻ em:</span>
                <span className={styles.detailValue}>{historyBooking.TreEm}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Số lượng phòng đặt:</span>
                <span className={styles.detailValue}>{historyBooking.SoLuongPhong}</span>
              </div>
               <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Thời gian đến dự kiến:</span>
                <span className={styles.detailValue}>{historyBooking.ThoiGianDen}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tổng tiền:</span>
                <span className={styles.detailValue}>{historyBooking.tongTienDisplay}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Trạng thái:</span>
                <span className={styles.detailValue}>
                  <span className={statusMap[historyBooking.TrangThai]?.className || styles.status}>
                    {statusMap[historyBooking.TrangThai]?.label || historyBooking.TrangThai}
                  </span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ghi chú:</span>
                <span className={styles.detailValue}>{historyBooking.GhiChu || '(Không có)'}</span>
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