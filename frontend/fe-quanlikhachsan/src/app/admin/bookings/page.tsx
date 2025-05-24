'use client';
import React, { useState, useEffect } from "react";
import styles from "./BookingManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '@/lib/api';

interface ChiTietDatPhongBE {
  maPhong: string;
  // Các trường khác nếu có, ví dụ: donGiaTaiThoiDiemDat, soLuongNguoi, ...
}

// Interface cho dữ liệu Đặt phòng từ BE
interface BookingBE {
  maDatPhong: string;
  maKH: string;
  maPhong: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  trangThai: string;
  ghiChu?: string;
  treEm?: number;
  nguoiLon?: number;
  soLuongPhong?: number;
  thoiGianDen?: string;
  chiTietDatPhongs?: ChiTietDatPhongBE[];
}

// Interface cho dữ liệu Phòng từ BE (tương tự file quản lý phòng)
interface PhongBE {
  maPhong: string;
  maLoaiPhong: string;
  soPhong: string;
  // Các trường khác như thumbnail, trangThai, tang nếu cần
}

// Interface cho dữ liệu Loại Phòng từ BE (tương tự file quản lý phòng)
interface LoaiPhongBE {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  giaMoiGio: number;
  giaMoiDem: number;
  // Các trường khác nếu cần
}

// Interface để hiển thị trong bảng, có thể kết hợp thêm thông tin
interface BookingDisplay extends BookingBE {
  tenKhachHang?: string;
  tenPhongDisplay?: string; 
  tongTienDisplay?: string; 
}

// Interface cho state của form (camelCase, để nhất quán với dữ liệu hiển thị)
// Khi gửi đi qua FormData, các key sẽ được chuyển thành PascalCase
interface BookingFormState {
  maKH: string; 
  ngayNhanPhong: string;
  ngayTraPhong: string;
  ghiChu?: string;
  treEm?: number;
  nguoiLon?: number;
  soLuongPhong?: number;
  thoiGianDen?: string;
  trangThai?: string; // Dùng để hiển thị trong form sửa, không gửi đi nếu DTO không yêu cầu
}

const statusMap: Record<string, { label: string; className: string }> = {
  "Đã đặt": { label: "Đã đặt", className: styles["status"] + " " + styles["status-booked"] },
  "Đã nhận phòng": { label: "Đã nhận phòng", className: styles["status"] + " " + styles["status-checkedin"] },
  "Đã trả phòng": { label: "Đã trả phòng", className: styles["status"] + " " + styles["status-checkedout"] },
  "Đã hủy": { label: "Đã hủy", className: styles["status"] + " " + styles["status-cancelled"] },
  "Chờ thanh toán": { label: "Chờ thanh toán", className: styles["status"] + " " + styles["status-pending"] },
  "Hoàn thành": { label: "Hoàn thành", className: styles["status"] + " " + styles["status-completed"] }, 
  "Đã xác nhận": { label: "Đã xác nhận", className: styles["status"] + " " + styles["status-confirmed"] }, // Thêm từ data
  "Chờ xác nhận": { label: "Chờ xác nhận", className: styles["status"] + " " + styles["status-waiting"] }, // Thêm từ data
  "Chưa xác nhận": { label: "Chưa xác nhận", className: styles["status"] + " " + styles["status-unconfirmed"] }, // Thêm từ data
};

export default function BookingManager() {
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBooking, setEditBooking] = useState<BookingDisplay | null>(null);
  const [form, setForm] = useState<BookingFormState>({
    maKH: "",
    ngayNhanPhong: "",
    ngayTraPhong: "",
    trangThai: "Đã đặt",
    ghiChu: "",
    treEm: 0,
    nguoiLon: 1,
    soLuongPhong: 1,
    thoiGianDen: "14:00"
  });
  const [historyBooking, setHistoryBooking] = useState<BookingDisplay | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<{maKh: string, hoKh: string, tenKh: string}[]>([]);
  const [allRooms, setAllRooms] = useState<PhongBE[]>([]);
  const [allRoomTypes, setAllRoomTypes] = useState<LoaiPhongBE[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Fetching data..."); // DEBUG

      try {
        const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        console.log("Bookings API response status:", bookingsResponse.status); // DEBUG
        
        const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        console.log("Customers API response status:", customersResponse.status); // DEBUG
        
        const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        console.log("Rooms API response status:", roomsResponse.status); // DEBUG

        const roomTypesResponse = await fetch(`${API_BASE_URL}/LoaiPhong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        console.log("RoomTypes API response status:", roomTypesResponse.status); // DEBUG
        
        const bookingsData = await handleResponse(bookingsResponse);
        console.log("Raw bookingsData from handleResponse:", JSON.stringify(bookingsData, null, 2)); // DEBUG
        
        const customersData = await handleResponse(customersResponse);
        console.log("Raw customersData from handleResponse:", JSON.stringify(customersData, null, 2)); // DEBUG
        
        const roomsData = await handleResponse(roomsResponse);
        console.log("Raw roomsData from handleResponse:", JSON.stringify(roomsData, null, 2)); // DEBUG

        const roomTypesData = await handleResponse(roomTypesResponse);
        console.log("Raw roomTypesData from handleResponse:", JSON.stringify(roomTypesData, null, 2)); // DEBUG
        
        // Dữ liệu từ API là camelCase
        const bookingsArray: BookingBE[] = Array.isArray(bookingsData) ? bookingsData : [];
        console.log("Parsed bookingsArray:", JSON.stringify(bookingsArray, null, 2)); // DEBUG

        const customersArray: any[] = Array.isArray(customersData) ? customersData : [];
        console.log("Parsed customersArray:", JSON.stringify(customersArray, null, 2)); // DEBUG
        
        setCustomers(customersArray.map(c => ({ maKh: c.maKh, hoKh: c.hoKh, tenKh: c.tenKh })));
        
        const allRoomsArray: PhongBE[] = Array.isArray(roomsData) ? roomsData : [];
        setAllRooms(allRoomsArray);
        console.log("Parsed allRoomsArray:", JSON.stringify(allRoomsArray, null, 2)); // DEBUG

        const allRoomTypesArray: LoaiPhongBE[] = Array.isArray(roomTypesData) ? roomTypesData : [];
        setAllRoomTypes(allRoomTypesArray);
        console.log("Parsed allRoomTypesArray:", JSON.stringify(allRoomTypesArray, null, 2)); // DEBUG
        
        const bookingsWithDetails = bookingsArray.map((apiBooking): BookingDisplay => {
          console.log("Processing apiBooking:", JSON.stringify(apiBooking, null, 2));
          const customer = customersArray.find(c => c.maKh === apiBooking.maKH);
          console.log("Found customer for maKH " + apiBooking.maKH + ":", JSON.stringify(customer, null, 2));

          let tenPhongDisplay = apiBooking.maPhong || "N/A";
          let totalAmount = 0;

          const room = allRoomsArray.find(r => r.maPhong === apiBooking.maPhong);
          if (room) {
            const roomType = allRoomTypesArray.find(rt => rt.maLoaiPhong === room.maLoaiPhong);
            if (roomType) {
              const { nights, hours } = calculateStayDetails(apiBooking.ngayNhanPhong, apiBooking.ngayTraPhong);
              console.log(`DEBUG: Room ${room.maPhong} (Type: ${roomType.tenLoaiPhong}) - PriceNight: ${roomType.giaMoiDem}, PriceHour: ${roomType.giaMoiGio}`);
              totalAmount = (nights * roomType.giaMoiDem) + (hours * roomType.giaMoiGio);
              console.log(`DEBUG: Cost for room ${room.maPhong}: ${totalAmount}`);
            }
          }
          
          return {
            ...apiBooking, 
            tenKhachHang: customer ? `${customer.hoKh} ${customer.tenKh}` : 'Không xác định',
            tenPhongDisplay: tenPhongDisplay,
            tongTienDisplay: totalAmount > 0 ? totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A',
          };
        });
        console.log("Final bookingsWithDetails:", JSON.stringify(bookingsWithDetails, null, 2)); // DEBUG
        
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

  const calculateStayDetails = (startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return { nights: 0, hours: 0, display: "Invalid dates" };
    }

    let diffMillis = endDate.getTime() - startDate.getTime();

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const MS_PER_HOUR = 60 * 60 * 1000;

    let nights = 0;
    let hours = 0;

    // Tính số đêm tròn trước
    nights = Math.floor(diffMillis / MS_PER_DAY);
    diffMillis -= nights * MS_PER_DAY;

    // Tính số giờ lẻ còn lại
    if (diffMillis > 0) {
      hours = Math.ceil(diffMillis / MS_PER_HOUR); // Làm tròn giờ lên
    }
    
    // Logic đơn giản: nếu giờ lẻ >= 12 thì tính là 1 đêm, ngược lại giữ nguyên giờ.
    // Hoặc có thể có quy tắc khác tùy theo nghiệp vụ (ví dụ: > 6 giờ tính 1 đêm)
    // Hiện tại: giữ nguyên số đêm và số giờ lẻ.
    // Nếu bạn muốn logic phức tạp hơn (vd: 28 giờ = 1 đêm + 4 giờ, hoặc = 2 đêm nếu > X giờ), cần điều chỉnh ở đây.

    let display = `${nights} đêm`;
    if (hours > 0) {
      display += `, ${hours} giờ`;
    }

    return { nights, hours, display };
  };

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString); // API trả về chuỗi ISO "2025-04-21T14:00:00"
      if (isNaN(date.getTime())) return dateString; 
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; 
          const year = parseInt(parts[2], 10);
          date = new Date(year, month, day);
        }
        if (isNaN(date.getTime())) return ''; 
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date for input:", dateString, error);
      return '';
    }
  };

  const openAddModal = () => {
    setForm({
      maKH: "",
      ngayNhanPhong: formatDateForInput(new Date().toISOString()),
      ngayTraPhong: formatDateForInput(new Date(Date.now() + 86400000).toISOString()), 
      ghiChu: "",
      treEm: 0,
      nguoiLon: 1,
      soLuongPhong: 1,
      thoiGianDen: "14:00",
      trangThai: "Đã đặt" // Mặc định hiển thị, không gửi nếu CreateDTO không có
    });
    setEditBooking(null);
    setShowAddModal(true);
  };

  const openEditModal = (booking: BookingDisplay) => {
    setForm({
      maKH: booking.maKH, // form state là camelCase
      ngayNhanPhong: formatDateForInput(booking.ngayNhanPhong),
      ngayTraPhong: formatDateForInput(booking.ngayTraPhong),
      trangThai: booking.trangThai, 
      ghiChu: booking.ghiChu || "",
      treEm: booking.treEm !== undefined ? booking.treEm : 0,
      nguoiLon: booking.nguoiLon !== undefined ? booking.nguoiLon : 1,
      soLuongPhong: booking.soLuongPhong !== undefined ? booking.soLuongPhong : 1,
      thoiGianDen: booking.thoiGianDen || "14:00",
    });
    setEditBooking(booking);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      // name của input trong form là camelCase
      [name]: (name === 'treEm' || name === 'nguoiLon' || name === 'soLuongPhong') && value !== '' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    
    // Gửi FormData với key PascalCase để khớp với DTO của BE
    if (!editBooking) { // Thêm mới
      formData.append('MaKH', form.maKH);
      formData.append('NgayNhanPhong', form.ngayNhanPhong);
      formData.append('NgayTraPhong', form.ngayTraPhong);
      if (form.ghiChu) formData.append('GhiChu', form.ghiChu);
      formData.append('TreEm', String(form.treEm || 0));
      formData.append('NguoiLon', String(form.nguoiLon || 1));
      formData.append('SoLuongPhong', String(form.soLuongPhong || 1));
      if (form.thoiGianDen) formData.append('ThoiGianDen', form.thoiGianDen);
      // CreateDatPhongDTO không có TrangThai
    }

    if (editBooking) { // Sửa
      // UpdateDatPhongDTO không có MaKH
      if (form.ngayNhanPhong) formData.append('NgayNhanPhong', form.ngayNhanPhong);
      if (form.ngayTraPhong) formData.append('NgayTraPhong', form.ngayTraPhong);
      if (form.ghiChu) formData.append('GhiChu', form.ghiChu);
      formData.append('TreEm', String(form.treEm || 0));
      formData.append('NguoiLon', String(form.nguoiLon || 1));
      formData.append('SoLuongPhong', String(form.soLuongPhong || 1));
      if (form.thoiGianDen) formData.append('ThoiGianDen', form.thoiGianDen);
      // UpdateDatPhongDTO không có TrangThai
    }

    try {
      const endpoint = editBooking 
        ? `${API_BASE_URL}/DatPhong/${editBooking.maDatPhong}` // editBooking.maDatPhong (camelCase)
        : `${API_BASE_URL}/DatPhong`;
      const method = editBooking ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: getFormDataHeaders(), 
        body: formData,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, { headers: getAuthHeaders('GET'), credentials: 'include' });
      const bookingsData = await handleResponse(bookingsResponse);
      const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, { headers: getAuthHeaders('GET'), credentials: 'include' });
      const customersData = await handleResponse(customersResponse);

      const bookingsArray: BookingBE[] = Array.isArray(bookingsData) ? bookingsData : [];
      const customersArray: any[] = Array.isArray(customersData) ? customersData : [];
      
      setCustomers(customersArray.map(c => ({ maKh: c.maKh, hoKh: c.hoKh, tenKh: c.tenKh })));
      
      const bookingsWithDetails = bookingsArray.map((apiBooking): BookingDisplay => {
        const customer = customersArray.find(c => c.maKh === apiBooking.maKH);
        return {
          ...apiBooking,
          tenKhachHang: customer ? `${customer.hoKh} ${customer.tenKh}` : 'Không xác định',
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
    (b.maDatPhong || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.maKH || '').toLowerCase().includes(search.toLowerCase())
  );

  // DEBUG: Log state and filtered array before rendering
  console.log("Rendering Bookings state:", JSON.stringify(bookings, null, 2));
  console.log("Rendering filtered Bookings:", JSON.stringify(filtered, null, 2));

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
            <tr><td colSpan={8} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu đặt phòng</td></tr>
          ) : (
            filtered.map(booking => {
              const maDatPhongDisplay = booking.maDatPhong;
              const tenKhachHangDisplay = booking.tenKhachHang || booking.maKH; // Ưu tiên tên, nếu không có thì hiển thị mã
              const tenPhongDisplay = booking.tenPhongDisplay; // Đã là maPhong
              const ngayNhanPhongDisplay = formatDate(booking.ngayNhanPhong);
              const ngayTraPhongDisplay = formatDate(booking.ngayTraPhong);
              const tongTienDisplay = booking.tongTienDisplay;
              const trangThaiDisplay = booking.trangThai;

              return (
                <tr key={maDatPhongDisplay}>
                  <td>{maDatPhongDisplay}</td>
                  <td>{tenKhachHangDisplay}</td>
                  <td>{tenPhongDisplay}</td>
                  <td>{ngayNhanPhongDisplay}</td>
                  <td>{ngayTraPhongDisplay}</td>
                  <td>{tongTienDisplay}</td>
                  <td>
                    <span className={statusMap[trangThaiDisplay]?.className || styles.status}>
                      {statusMap[trangThaiDisplay]?.label || trangThaiDisplay}
                    </span>
                  </td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button 
                      className={styles.editBtn} 
                      onClick={() => openEditModal(booking)}
                      // Vô hiệu hóa nếu trạng thái không cho phép sửa, ví dụ: Đã trả phòng, Đã hủy
                      disabled={trangThaiDisplay === 'Đã trả phòng' || trangThaiDisplay === 'Đã hủy'}
                    >
                      Sửa
                    </button>
                    <button 
                      className={styles.historyBtn} // Có thể đổi tên class thành detailBtn nếu muốn
                      onClick={() => setHistoryBooking(booking)}
                    >
                      Chi tiết
                    </button>
                    {/* Cân nhắc thêm nút Hủy đặt phòng nếu cần */}
                    {/* Ví dụ:
                    { (trangThaiDisplay === 'Đã đặt' || trangThaiDisplay === 'Đã xác nhận' || trangThaiDisplay === 'Chờ xác nhận') && (
                      <button
                        className={styles.cancelBookingBtn} // Cần định nghĩa style này
                        onClick={() => handleCancelBooking(booking.maDatPhong)} // Cần tạo hàm này
                      >
                        Hủy
                      </button>
                    )}
                    */}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
      )}

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Thêm đặt phòng</h3>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.formGroup}>
                <label htmlFor="maKH">Khách hàng</label>
                {/* name của select là maKH (camelCase) */}
                <select id="maKH" name="maKH" value={form.maKH} onChange={handleChange} required>
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.maKh} value={customer.maKh}>{customer.hoKh} {customer.tenKh} ({customer.maKh})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ngayNhanPhong">Ngày đến</label>
                <input type="date" id="ngayNhanPhong" name="ngayNhanPhong" value={form.ngayNhanPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ngayTraPhong">Ngày đi</label>
                <input type="date" id="ngayTraPhong" name="ngayTraPhong" value={form.ngayTraPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="thoiGianDen">Thời gian đến dự kiến</label>
                <input type="text" id="thoiGianDen" name="thoiGianDen" value={form.thoiGianDen || ""} onChange={handleChange} placeholder="HH:mm" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="nguoiLon">Số người lớn</label>
                <input type="number" id="nguoiLon" name="nguoiLon" value={form.nguoiLon || 0} onChange={handleChange} min="1" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="treEm">Số trẻ em</label>
                <input type="number" id="treEm" name="treEm" value={form.treEm || 0} onChange={handleChange} min="0" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="soLuongPhong">Số lượng phòng</label>
                <input type="number" id="soLuongPhong" name="soLuongPhong" value={form.soLuongPhong || 0} onChange={handleChange} min="1" />
              </div>
               <div className={styles.formGroup}>
                <label htmlFor="ghiChu">Ghi chú</label>
                <textarea id="ghiChu" name="ghiChu" value={form.ghiChu || ""} onChange={handleChange} rows={3} />
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn} disabled={isLoading}>Lưu</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa đặt phòng - Mã: {editBooking.maDatPhong}</h3>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.formGroup}>
                <label htmlFor="maKH_edit">Khách hàng (Không thể sửa)</label>
                <input id="maKH_edit" name="maKH_edit" value={`${editBooking.tenKhachHang} (${editBooking.maKH})`} disabled />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ngayNhanPhong_edit">Ngày đến</label>
                <input type="date" id="ngayNhanPhong_edit" name="ngayNhanPhong" value={form.ngayNhanPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ngayTraPhong_edit">Ngày đi</label>
                <input type="date" id="ngayTraPhong_edit" name="ngayTraPhong" value={form.ngayTraPhong} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="thoiGianDen_edit">Thời gian đến dự kiến</label>
                <input type="text" id="thoiGianDen_edit" name="thoiGianDen" value={form.thoiGianDen || ""} onChange={handleChange} placeholder="HH:mm" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="nguoiLon_edit">Số người lớn</label>
                <input type="number" id="nguoiLon_edit" name="nguoiLon" value={form.nguoiLon || 0} onChange={handleChange} min="1" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="treEm_edit">Số trẻ em</label>
                <input type="number" id="treEm_edit" name="treEm" value={form.treEm || 0} onChange={handleChange} min="0" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="soLuongPhong_edit">Số lượng phòng</label>
                <input type="number" id="soLuongPhong_edit" name="soLuongPhong" value={form.soLuongPhong || 0} onChange={handleChange} min="1" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ghiChu_edit">Ghi chú</label>
                <textarea id="ghiChu_edit" name="ghiChu" value={form.ghiChu || ""} onChange={handleChange} rows={3} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="trangThai_edit">Trạng thái (Chỉ hiển thị - Không sửa qua form này)</label>
                {/* name của select là trangThai (camelCase) */}
                <select id="trangThai_edit" name="trangThai" value={form.trangThai} onChange={handleChange} disabled>
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
                <span className={styles.detailValue}>{historyBooking.tenKhachHang || historyBooking.maKH}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phòng:</span>
                <span className={styles.detailValue}>{historyBooking.tenPhongDisplay}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nhận phòng:</span>
                <span className={styles.detailValue}>{formatDate(historyBooking.ngayNhanPhong)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Trả phòng:</span>
                <span className={styles.detailValue}>{formatDate(historyBooking.ngayTraPhong)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Số người lớn:</span>
                <span className={styles.detailValue}>{historyBooking.nguoiLon}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Số trẻ em:</span>
                <span className={styles.detailValue}>{historyBooking.treEm}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Số lượng phòng đặt:</span>
                <span className={styles.detailValue}>{historyBooking.soLuongPhong}</span>
              </div>
               <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Thời gian đến dự kiến:</span>
                <span className={styles.detailValue}>{historyBooking.thoiGianDen}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tổng tiền:</span>
                <span className={styles.detailValue}>{historyBooking.tongTienDisplay}</span>
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