'use client';
import React, { useState, useEffect } from "react";
import styles from "./BookingManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '@/lib/api';

// Interface cho dữ liệu Đặt phòng từ BE (camelCase, khớp với JSON response)
interface BookingBE {
  maDatPhong: string;
  maKH: string;
  maPhong: string; // Thêm maPhong
  ngayNhanPhong: string;
  ngayTraPhong: string;
  trangThai: string;
  ghiChu?: string;
  treEm?: number;
  nguoiLon?: number;
  soLuongPhong?: number;
  thoiGianDen?: string;
}

// Interface để hiển thị trong bảng, có thể kết hợp thêm thông tin
interface BookingDisplay extends BookingBE {
  tenKhachHang?: string;
  tenPhongDisplay?: string; 
  tongTienDisplay?: string; 
}

// Interface cho Loại phòng từ BE
interface RoomTypeBE {
  maLoaiPhong: string;
  tenLoaiPhong?: string;
  giaMoiGio: number;
  giaMoiDem: number;
  // Các trường khác nếu cần
}

// Interface cho Phòng từ BE (cần chứa maLoaiPhong)
interface RoomInfoBE {
  maPhong: string;
  soPhong: string;
  maLoaiPhong: string;
  // Các trường khác nếu cần
}

// Interface cho state của form (camelCase, để nhất quán với dữ liệu hiển thị)
interface BookingFormState {
  maKH: string; 
  maPhong: string; // Thêm maPhong
  ngayNhanPhong: string;
  ngayTraPhong: string;
  ghiChu?: string;
  treEm?: number;
  nguoiLon?: number;
  soLuongPhong?: number;
  thoiGianDen?: string;
  trangThai?: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  "Đã đặt": { label: "Đã đặt", className: styles["status"] + " " + styles["status-booked"] },
  "Đã nhận phòng": { label: "Đã nhận phòng", className: styles["status"] + " " + styles["status-checkedin"] },
  "Đã trả phòng": { label: "Đã trả phòng", className: styles["status"] + " " + styles["status-checkedout"] },
  "Đã hủy": { label: "Đã hủy", className: styles["status"] + " " + styles["status-cancelled"] },
  "Chờ thanh toán": { label: "Chờ thanh toán", className: styles["status"] + " " + styles["status-pending"] },
  "Hoàn thành": { label: "Hoàn thành", className: styles["status"] + " " + styles["status-completed"] }, 
  "Đã xác nhận": { label: "Đã xác nhận", className: styles["status"] + " " + styles["status-confirmed"] },
  "Chờ xác nhận": { label: "Chờ xác nhận", className: styles["status"] + " " + styles["status-waiting"] },
  "Chưa xác nhận": { label: "Chưa xác nhận", className: styles["status"] + " " + styles["status-unconfirmed"] },
};

export default function BookingManager() {
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBooking, setEditBooking] = useState<BookingDisplay | null>(null);
  const [form, setForm] = useState<BookingFormState>({
    maKH: "",
    maPhong: "", // Thêm maPhong
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
  const [rooms, setRooms] = useState<RoomInfoBE[]>([]); // Cập nhật để chứa RoomInfoBE
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roomTypes, setRoomTypes] = useState<RoomTypeBE[]>([]); // State cho loại phòng

  // Hàm format tiền tệ
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Hàm tính toán thời gian ở và tổng tiền
  const calculateStayDurationAndCost = (
    checkInDateStr: string,
    checkOutDateStr: string,
    giaMoiDem: number,
    giaMoiGio: number
  ): { nights: number; hours: number; totalCost: number } => {
    if (!checkInDateStr || !checkOutDateStr) {
      return { nights: 0, hours: 0, totalCost: 0 };
    }
    try {
      const checkInDate = new Date(checkInDateStr);
      const checkOutDate = new Date(checkOutDateStr);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
        return { nights: 0, hours: 0, totalCost: 0 };
      }

      const timeDiffMs = checkOutDate.getTime() - checkInDate.getTime();
      const totalHours = timeDiffMs / (1000 * 60 * 60);
      
      const nights = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;

      // Logic tính tiền: (số đêm * giá đêm) + (số giờ còn lại * giá giờ)
      // Điều chỉnh logic này nếu chính sách khách sạn khác
      let calculatedCost = (nights * giaMoiDem) + (remainingHours > 0 ? (Math.ceil(remainingHours) * giaMoiGio) : 0);
      // Nếu không có đêm nào, và có giờ lẻ, chỉ tính tiền giờ.
      if (nights === 0 && remainingHours > 0) {
        calculatedCost = Math.ceil(remainingHours) * giaMoiGio;
      } else if (nights > 0 && remainingHours > 0) {
         // Nếu có đêm và có giờ lẻ, cộng thêm tiền của các giờ lẻ đó
         // Giả sử nếu đã ở qua 1 đêm, thì các giờ lẻ trong ngày tiếp theo vẫn tính theo giá giờ
         // Hoặc có thể có chính sách: nếu > X giờ thì tính thêm 1 đêm (cần làm rõ)
         // Hiện tại: tính tiền giờ cho phần lẻ.
      }

      return {
        nights,
        hours: remainingHours > 0 ? Math.ceil(remainingHours) : 0,
        totalCost: calculatedCost
      };
    } catch (e) {
      console.error("Error calculating stay duration and cost:", e);
      return { nights: 0, hours: 0, totalCost: 0 };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Fetching data...");

      try {
        // Fetch all data concurrently
        const [bookingsResponse, customersResponse, roomsResponse, roomTypesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/DatPhong`, { method: 'GET', headers: getAuthHeaders('GET'), credentials: 'include' }),
          fetch(`${API_BASE_URL}/KhachHang`, { method: 'GET', headers: getAuthHeaders('GET'), credentials: 'include' }),
          fetch(`${API_BASE_URL}/Phong`, { method: 'GET', headers: getAuthHeaders('GET'), credentials: 'include' }),
          fetch(`${API_BASE_URL}/LoaiPhong`, { method: 'GET', headers: getAuthHeaders('GET'), credentials: 'include' }) // Fetch Loại Phòng
        ]);

        console.log("Bookings API status:", bookingsResponse.status);
        console.log("Customers API status:", customersResponse.status);
        console.log("Rooms API status:", roomsResponse.status);
        console.log("RoomTypes API status:", roomTypesResponse.status); // Log status

        // Handle responses and parse data
        const bookingsData = await handleResponse(bookingsResponse);
        const customersData = await handleResponse(customersResponse);
        const roomsDataFromApi = await handleResponse(roomsResponse);
        const roomTypesDataFromApi = await handleResponse(roomTypesResponse); // Parse Loại Phòng

        console.log("Raw bookingsData:", JSON.stringify(bookingsData, null, 2));
        console.log("Raw customersData:", JSON.stringify(customersData, null, 2));
        console.log("Raw roomsDataFromApi:", JSON.stringify(roomsDataFromApi, null, 2));
        console.log("Raw roomTypesDataFromApi:", JSON.stringify(roomTypesDataFromApi, null, 2)); // Log Loại Phòng

        const bookingsArray: BookingBE[] = Array.isArray(bookingsData) ? bookingsData : [];
        const customersApiArray: any[] = Array.isArray(customersData) ? customersData : [];
        const roomsApiArray: any[] = Array.isArray(roomsDataFromApi) ? roomsDataFromApi : [];
        const roomTypesApiArray: any[] = Array.isArray(roomTypesDataFromApi) ? roomTypesDataFromApi : []; // Mảng Loại Phòng từ API

        // Process customers data
        const processedCustomers = customersApiArray.map(c => ({ 
          maKh: c.maKh || c.MaKh, 
          hoKh: c.hoKh || c.HoKh || "", 
          tenKh: c.tenKh || c.TenKh || "" 
        }));
        setCustomers(processedCustomers);

        // Process rooms data, ensure maLoaiPhong is included
        const processedRooms = roomsApiArray.map((r): RoomInfoBE => ({ 
          maPhong: r.maPhong || r.MaPhong, 
          soPhong: r.soPhong || r.SoPhong || "N/A",
          maLoaiPhong: r.maLoaiPhong || r.MaLoaiPhong // Quan trọng: Lấy maLoaiPhong
        }));
        setRooms(processedRooms);

        // Process room types data
        const processedRoomTypes = roomTypesApiArray.map((rt): RoomTypeBE => ({ 
          maLoaiPhong: rt.maLoaiPhong || rt.MaLoaiPhong,
          tenLoaiPhong: rt.tenLoaiPhong || rt.TenLoaiPhong,
          giaMoiGio: parseFloat(rt.giaMoiGio) || 0,
          giaMoiDem: parseFloat(rt.giaMoiDem) || 0,
        }));
        setRoomTypes(processedRoomTypes);
        
        const bookingsWithDetails = bookingsArray.map((apiBooking): BookingDisplay => {
          const currentMaKH = apiBooking.maKH;
          const currentMaPhong = apiBooking.maPhong;

          const customer = processedCustomers.find(c => c.maKh === currentMaKH);
          const room = processedRooms.find(r => r.maPhong === currentMaPhong);
          
          let roomType: RoomTypeBE | undefined = undefined;
          if (room && room.maLoaiPhong) {
            roomType = processedRoomTypes.find(rt => rt.maLoaiPhong === room.maLoaiPhong);
          }

          console.log(`Processing MaDatPhong ${apiBooking.maDatPhong}: MaPhong=${currentMaPhong}, MaLoaiPhong=${room?.maLoaiPhong}, RoomType Found=${!!roomType}`);

          let calculatedTotalCost = 0;
          if (roomType) {
            const { totalCost } = calculateStayDurationAndCost(
              apiBooking.ngayNhanPhong,
              apiBooking.ngayTraPhong,
              roomType.giaMoiDem,
              roomType.giaMoiGio
            );
            calculatedTotalCost = totalCost;
          }
          
          return {
            ...apiBooking, 
            tenKhachHang: customer ? `${customer.hoKh} ${customer.tenKh}`.trim() : 'Không xác định',
            tenPhongDisplay: room ? room.soPhong : (currentMaPhong ? `P:${currentMaPhong} (không tìm thấy)` : 'N/A'),
            tongTienDisplay: formatCurrency(calculatedTotalCost), 
          };
        });
        console.log("Final bookingsWithDetails:", JSON.stringify(bookingsWithDetails, null, 2));
        
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
      maPhong: "", // Thêm maPhong
      ngayNhanPhong: formatDateForInput(new Date().toISOString()),
      ngayTraPhong: formatDateForInput(new Date(Date.now() + 86400000).toISOString()), 
      ghiChu: "",
      treEm: 0,
      nguoiLon: 1,
      soLuongPhong: 1,
      thoiGianDen: "14:00",
      trangThai: "Đã đặt"
    });
    setEditBooking(null);
    setShowAddModal(true);
  };

  const openEditModal = (booking: BookingDisplay) => {
    setForm({
      maKH: booking.maKH,
      maPhong: booking.maPhong, // Thêm maPhong
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
      [name]: (name === 'treEm' || name === 'nguoiLon' || name === 'soLuongPhong') && value !== '' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    
    // API BE DatPhongController CreateDatPhongAsync nhận các trường PascalCase
    if (!editBooking) { // Trường hợp thêm mới
      formData.append('MaKH', form.maKH);
      formData.append('MaPhong', form.maPhong); 
      formData.append('NgayNhanPhong', form.ngayNhanPhong);
      formData.append('NgayTraPhong', form.ngayTraPhong);
      if (form.ghiChu) formData.append('GhiChu', form.ghiChu);
      formData.append('TreEm', String(form.treEm || 0));
      formData.append('NguoiLon', String(form.nguoiLon || 1));
      formData.append('SoLuongPhong', String(form.soLuongPhong || 1));
      if (form.thoiGianDen) formData.append('ThoiGianDen', form.thoiGianDen);
      // TrangThai thường do BE tự set khi tạo mới, hoặc có giá trị mặc định.
      // Nếu BE yêu cầu gửi TrangThai khi POST, thêm dòng sau:
      // if (form.trangThai) formData.append('TrangThai', form.trangThai);

    } else { // Trường hợp cập nhật
      // Đối với PUT, chỉ gửi các trường có thể thay đổi và BE cho phép
      // MaKH và MaDatPhong thường không đổi hoặc được xác định qua URL
      if (form.maPhong) formData.append('MaPhong', form.maPhong);
      if (form.ngayNhanPhong) formData.append('NgayNhanPhong', form.ngayNhanPhong);
      if (form.ngayTraPhong) formData.append('NgayTraPhong', form.ngayTraPhong);
      if (form.ghiChu !== undefined) formData.append('GhiChu', form.ghiChu); // Gửi cả chuỗi rỗng nếu người dùng xóa
      if (form.treEm !== undefined) formData.append('TreEm', String(form.treEm));
      if (form.nguoiLon !== undefined) formData.append('NguoiLon', String(form.nguoiLon));
      if (form.soLuongPhong !== undefined) formData.append('SoLuongPhong', String(form.soLuongPhong));
      if (form.thoiGianDen !== undefined) formData.append('ThoiGianDen', form.thoiGianDen);
      if (form.trangThai) formData.append('TrangThai', form.trangThai); // Cho phép cập nhật trạng thái
    }

    try {
      const endpoint = editBooking 
        ? `${API_BASE_URL}/DatPhong/${editBooking.maDatPhong}`
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
      const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, { headers: getAuthHeaders('GET'), credentials: 'include' });
      const roomsData = await handleResponse(roomsResponse);

      const bookingsArray: BookingBE[] = Array.isArray(bookingsData) ? bookingsData : [];
      const customersArray: any[] = Array.isArray(customersData) ? customersData : [];
      const roomsApiArray: any[] = Array.isArray(roomsData) ? roomsData : [];
      
      // Process customers data immediately
      const processedCustomersAfterSubmit = customersArray.map(c => ({ 
        maKh: c.maKh || c.MaKh, 
        hoKh: c.hoKh || c.HoKh || "", 
        tenKh: c.tenKh || c.TenKh || "" 
      }));
      setCustomers(processedCustomersAfterSubmit);

      // Process rooms data immediately
      const processedRoomsAfterSubmit = roomsApiArray.map((r): RoomInfoBE => ({ 
        maPhong: r.maPhong || r.MaPhong, 
        soPhong: r.soPhong || r.SoPhong || "N/A",
        maLoaiPhong: r.maLoaiPhong || r.MaLoaiPhong
      }));
      setRooms(processedRoomsAfterSubmit);
      
      const bookingsWithDetails = bookingsArray.map((apiBooking): BookingDisplay => {
        const currentMaKH = apiBooking.maKH;
        const currentMaPhong = apiBooking.maPhong;
        const customer = processedCustomersAfterSubmit.find(c => c.maKh === currentMaKH);
        const room = processedRoomsAfterSubmit.find(r => r.maPhong === currentMaPhong);
        return {
          ...apiBooking,
          tenKhachHang: customer ? `${customer.hoKh} ${customer.tenKh}`.trim() : 'Không xác định',
          tenPhongDisplay: room ? room.soPhong : (currentMaPhong ? `P:${currentMaPhong} (không tìm thấy)` : 'N/A'),
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
    (b.maKH || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.maPhong || '').toLowerCase().includes(search.toLowerCase()) // Thêm tìm kiếm theo maPhong
  );

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
            placeholder="Tìm kiếm khách/mã đặt phòng/mã phòng..."
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
          ) : (
            filtered.map(booking => {
              const maDatPhongDisplay = booking.maDatPhong;
              const tenKhachHangDisplay = booking.tenKhachHang || booking.maKH;
              const tenPhongDisplay = booking.tenPhongDisplay;
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
                  <td><span className={statusMap[trangThaiDisplay]?.className || styles.status}>{statusMap[trangThaiDisplay]?.label || trangThaiDisplay}</span></td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button className={styles.editBtn} onClick={() => openEditModal(booking)}>Sửa</button>
                    <button className={styles.historyBtn} onClick={() => setHistoryBooking(booking)}>Chi tiết</button>
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
                <select id="maKH" name="maKH" value={form.maKH} onChange={handleChange} required>
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.maKh} value={customer.maKh}>{customer.hoKh} {customer.tenKh} ({customer.maKh})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="maPhong">Mã Phòng</label>
                <select id="maPhong" name="maPhong" value={form.maPhong} onChange={handleChange} required>
                  <option value="">Chọn phòng</option>
                  {rooms.map(room => (
                    <option key={room.maPhong} value={room.maPhong}>{room.soPhong} ({room.maPhong})</option>
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
                <label htmlFor="maPhong_edit">Mã Phòng</label>
                <select id="maPhong_edit" name="maPhong" value={form.maPhong} onChange={handleChange} required>
                  <option value="">Chọn phòng</option>
                  {rooms.map(room => (
                    <option key={room.maPhong} value={room.maPhong}>{room.soPhong} ({room.maPhong})</option>
                  ))}
                </select>
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