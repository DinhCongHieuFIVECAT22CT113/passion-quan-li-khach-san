'use client';
import React, { useState, useEffect } from "react";
import styles from "./InvoiceManager.module.css";
import { getInvoices, getBookingHistory, getCustomerProfile, deleteInvoice, updateInvoice } from "../../../lib/api";
import { API_BASE_URL } from '../../../lib/config';

interface Invoice {
  maHoaDon: string;
  maDatPhong: string;
  maKM?: string;
  tenKhuyenMai?: string;
  giamGiaLoaiKM?: number;
  giamGiaLoaiKH?: number;
  tongTien: number;
  soTienDaThanhToan?: number;
  soTienConThieu?: number;
  soTienThanhToanDu?: number;
  trangThai: string;
  ngayTao?: string;
  ngaySua?: string;
  // Thông tin kết hợp
  tenKhachHang?: string;
}

interface Booking {
  maDatPhong: string;
  maKh: string;
  // các trường khác của đặt phòng
}

interface Customer {
  maKh: string;
  hoKh: string;
  tenKh: string;
  // các trường khác của khách hàng
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Invoice>({ 
    maHoaDon: "", 
    maDatPhong: "", 
    tongTien: 0, 
    trangThai: "" 
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Lấy danh sách hóa đơn từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Lấy danh sách hóa đơn
        const invoicesData = await getInvoices();
        
        // Lấy danh sách đặt phòng
        const bookingsData = await getBookingHistory("");
        setBookings(bookingsData);
        
        // Lấy thông tin khách hàng cho mỗi đặt phòng
        const customersData: Customer[] = [];
        const customerMap = new Map<string, Customer>();
        
        // Trước tiên, tạo một danh sách các mã khách hàng duy nhất
        const uniqueCustomerIds: string[] = [];
        bookingsData.forEach((booking: Booking) => {
          if (booking.maKh && !uniqueCustomerIds.includes(booking.maKh)) {
            uniqueCustomerIds.push(booking.maKh);
          }
        });
        
        // Lấy thông tin của từng khách hàng
        for (const maKh of uniqueCustomerIds) {
          try {
            const customerData = await getCustomerProfile(maKh);
            customersData.push(customerData);
            customerMap.set(maKh, customerData);
          } catch (err) {
            console.error(`Không thể lấy thông tin khách hàng ${maKh}:`, err);
          }
        }
        
        setCustomers(customersData);
        
        // Kết hợp thông tin khách hàng vào hóa đơn
        const enhancedInvoices = invoicesData.map((invoice: Invoice) => {
          const booking = bookingsData.find((b: Booking) => b.maDatPhong === invoice.maDatPhong);
          let tenKhachHang = "Không xác định";
          
          if (booking) {
            const customer = customerMap.get(booking.maKh);
            if (customer) {
              tenKhachHang = `${customer.hoKh} ${customer.tenKh}`;
            }
          }
          
          return {
            ...invoice,
            tenKhachHang,
            tongTien: invoice.tongTien || 0,
            soTienDaThanhToan: invoice.soTienDaThanhToan || 0,
            soTienConThieu: invoice.soTienConThieu || 0,
            trangThai: invoice.trangThai || "Chưa thanh toán"
          };
        });
        
        setInvoices(enhancedInvoices);
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Khi mở modal Thêm mới
  const openAddModal = () => {
    setForm({ 
      maHoaDon: "", 
      maDatPhong: "", 
      tongTien: 0, 
      trangThai: "Chưa thanh toán"
    });
    setShowAddModal(true);
  };

  // Khi mở modal Sửa
  const openEditModal = (invoice: Invoice) => {
    setForm(invoice);
    setEditInvoice(invoice);
  };

  // Khi mở modal Xem
  const openViewModal = (invoice: Invoice) => {
    setViewInvoice(invoice);
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'tongTien' || name === 'soTienDaThanhToan' || name === 'soTienConThieu' ? 
        Number(value) : value 
    });
  };

  // Xử lý submit Thêm mới - chuyển người dùng đến trang tạo hóa đơn riêng biệt
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    // Chuyển hướng đến trang tạo hóa đơn chi tiết
    window.location.href = `/admin/invoices/create`;
  };

  // Xử lý submit Sửa
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Đảm bảo giá trị số
      const updatedForm = {
        ...form,
        tongTien: Number(form.tongTien),
        soTienDaThanhToan: form.soTienDaThanhToan !== undefined ? Number(form.soTienDaThanhToan) : undefined,
        soTienConThieu: form.soTienConThieu !== undefined ? Number(form.soTienConThieu) : undefined
      };
      
      await updateInvoice(form.maHoaDon, updatedForm);
      
      // Cập nhật danh sách hóa đơn
      setInvoices(invoices.map(inv => inv.maHoaDon === form.maHoaDon ? {...inv, ...updatedForm} : inv));
    setEditInvoice(null);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      console.error("Error updating invoice:", err);
    }
  };

  // Xử lý xóa hóa đơn
  const handleDelete = async (maHoaDon: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) {
      try {
        await deleteInvoice(maHoaDon);
        setInvoices(invoices.filter(inv => inv.maHoaDon !== maHoaDon));
      } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
        console.error("Error deleting invoice:", err);
      }
    }
  };

  // Xuất hóa đơn PDF
  const handleExportPDF = (invoice: Invoice) => {
    window.open(`/admin/invoices/export?id=${invoice.maHoaDon}`, '_blank');
  };

  // Lọc theo search
  const filtered = invoices.filter(inv =>
    (inv.tenKhachHang || '').toLowerCase().includes(search.toLowerCase()) ||
    inv.maHoaDon.toLowerCase().includes(search.toLowerCase()) ||
    inv.maDatPhong.toLowerCase().includes(search.toLowerCase())
  );

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      .replace('₫', '').trim();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý hóa đơn</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, mã hóa đơn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{padding:'8px 14px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:'1rem', background:'#f9fafb', minWidth:220}}
          />
          <button className={styles.addBtn} onClick={openAddModal}>+ Thêm hóa đơn</button>
        </div>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu hóa đơn...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
      <div style={{overflowX:'auto'}}>
      <table className={styles.table}>
        <thead>
          <tr>
                <th>Mã HD</th>
            <th>Khách hàng</th>
                <th>Đặt phòng</th>
                <th>Tổng tiền (VNĐ)</th>
                <th>Đã thanh toán (VNĐ)</th>
                <th>Còn thiếu (VNĐ)</th>
                <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu</td></tr>
          ) : filtered.map(invoice => (
                <tr key={invoice.maHoaDon}>
                  <td>{invoice.maHoaDon}</td>
                  <td>{invoice.tenKhachHang || "Không xác định"}</td>
                  <td>{invoice.maDatPhong}</td>
                  <td>{formatCurrency(invoice.tongTien || 0)}</td>
                  <td>{formatCurrency(invoice.soTienDaThanhToan || 0)}</td>
                  <td>{formatCurrency(invoice.soTienConThieu || 0)}</td>
                  <td>{invoice.ngayTao ? new Date(invoice.ngayTao).toLocaleDateString('vi-VN') : "N/A"}</td>
                  <td>
                    <span 
                      className={`${styles.status} ${
                        invoice.trangThai === "Đã thanh toán" ? styles["status-paid"] : 
                        invoice.trangThai === "Chưa thanh toán" ? styles["status-unpaid"] : styles["status"]
                      }`}
                    >
                      {invoice.trangThai || "N/A"}
                    </span>
                  </td>
              <td style={{whiteSpace:'nowrap'}}>
                    <button className={styles.viewBtn} onClick={() => openViewModal(invoice)}>Xem</button>
                <button className={styles.editBtn} onClick={() => openEditModal(invoice)}>Sửa</button>
                    <button className={styles.pdfBtn} onClick={() => handleExportPDF(invoice)}>PDF</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(invoice.maHoaDon)}>Xóa</button>
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
            <h3>Thêm hóa đơn</h3>
            <form onSubmit={handleAdd} autoComplete="off">
              <p style={{marginBottom:12}}>Hóa đơn sẽ được tạo dựa trên thông tin đặt phòng.</p>
              <div style={{marginTop: 12, display:'flex', gap:8}}>
                <button type="submit" className={styles.editBtn}>Tiếp tục</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.pdfBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {editInvoice && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa hóa đơn #{form.maHoaDon}</h3>
            <form onSubmit={handleEdit} autoComplete="off">
              <div className={styles.formGroup}>
                <label>Tổng tiền (VNĐ)</label>
                <input 
                  name="tongTien" 
                  type="number" 
                  value={form.tongTien} 
                  onChange={handleChange} 
                  placeholder="Tổng tiền" 
                  required 
                  min={0} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Số tiền đã thanh toán (VNĐ)</label>
                <input 
                  name="soTienDaThanhToan" 
                  type="number" 
                  value={form.soTienDaThanhToan} 
                  onChange={handleChange} 
                  placeholder="Số tiền đã thanh toán" 
                  min={0} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Số tiền còn thiếu (VNĐ)</label>
                <input 
                  name="soTienConThieu" 
                  type="number" 
                  value={form.soTienConThieu} 
                  onChange={handleChange} 
                  placeholder="Số tiền còn thiếu" 
                  min={0} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Trạng thái</label>
                <select name="trangThai" value={form.trangThai} onChange={handleChange} required>
                <option value="">Chọn trạng thái</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                  <option value="Đã hủy">Đã hủy</option>
              </select>
              </div>
              
              <div style={{marginTop: 12, display:'flex', gap:8}}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setEditInvoice(null)} className={styles.pdfBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết */}
      {viewInvoice && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Chi tiết hóa đơn #{viewInvoice.maHoaDon}</h3>
            <div className={styles.invoiceDetails}>
              <div className={styles.detailRow}>
                <strong>Khách hàng:</strong>
                <span>{viewInvoice.tenKhachHang || "Không xác định"}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Mã đặt phòng:</strong>
                <span>{viewInvoice.maDatPhong}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Tổng tiền:</strong>
                <span>{formatCurrency(viewInvoice.tongTien || 0)} VNĐ</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Đã thanh toán:</strong>
                <span>{formatCurrency(viewInvoice.soTienDaThanhToan || 0)} VNĐ</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Còn thiếu:</strong>
                <span>{formatCurrency(viewInvoice.soTienConThieu || 0)} VNĐ</span>
              </div>
              {viewInvoice.maKM && (
                <div className={styles.detailRow}>
                  <strong>Khuyến mãi:</strong>
                  <span>{viewInvoice.tenKhuyenMai || viewInvoice.maKM}</span>
                </div>
              )}
              {viewInvoice.giamGiaLoaiKM && viewInvoice.giamGiaLoaiKM > 0 && (
                <div className={styles.detailRow}>
                  <strong>Giảm giá KM:</strong>
                  <span>{viewInvoice.giamGiaLoaiKM}%</span>
                </div>
              )}
              {viewInvoice.giamGiaLoaiKH && viewInvoice.giamGiaLoaiKH > 0 && (
                <div className={styles.detailRow}>
                  <strong>Giảm giá KH:</strong>
                  <span>{viewInvoice.giamGiaLoaiKH}%</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <strong>Trạng thái:</strong>
                <span 
                  className={`${styles.status} ${
                    viewInvoice.trangThai === "Đã thanh toán" ? styles["status-paid"] : 
                    viewInvoice.trangThai === "Chưa thanh toán" ? styles["status-unpaid"] : styles["status"]
                  }`}
                >
                  {viewInvoice.trangThai || "N/A"}
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>Ngày tạo:</strong>
                <span>{viewInvoice.ngayTao ? new Date(viewInvoice.ngayTao).toLocaleString('vi-VN') : "N/A"}</span>
              </div>
              {viewInvoice.ngaySua && (
                <div className={styles.detailRow}>
                  <strong>Cập nhật lần cuối:</strong>
                  <span>{new Date(viewInvoice.ngaySua).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
            
            <div style={{marginTop: 20, display:'flex', gap:8}}>
              <button onClick={() => handleExportPDF(viewInvoice)} className={styles.pdfBtn}>Xuất PDF</button>
              <button onClick={() => setViewInvoice(null)} className={styles.viewBtn}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 