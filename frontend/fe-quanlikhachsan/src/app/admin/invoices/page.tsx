'use client';
import React, { useState, useEffect } from "react";
import styles from "./InvoiceManager.module.css";
import { getInvoices, getBookingHistory, getCustomerProfile, deleteInvoice, updateInvoiceStatus, getAuthHeaders, handleResponse } from "../../../lib/api";
import { API_BASE_URL } from '../../../lib/config';

interface Invoice {
  MaHoaDon: string;
  MaDatPhong: string;
  MaKM?: string;
  TenKhuyenMai?: string;
  GiamGiaLoaiKM?: number;
  GiamGiaLoaiKH?: number;
  TongTien: number;
  TrangThai: string;
  NgayTao?: string;
  NgaySua?: string;
  // Thông tin kết hợp
  tenKhachHang?: string;
  soTienDaThanhToan?: number;
  soTienConThieu?: number;
}

interface Customer {
  MaKh: string;
  HoKh: string;
  TenKh: string;
  // các trường khác của khách hàng
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>({
    MaHoaDon: "",
    MaDatPhong: "",
    TongTien: 0,
    TrangThai: ""
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Không sử dụng
  // const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Không sử dụng
  // const [totalRevenue, setTotalRevenue] = useState<number>(0); // Không sử dụng
  // const [bookings, setBookings] = useState<Booking[]>([]); // Không sử dụng, dữ liệu bookings được lấy và xử lý trong fetchData nhưng không set vào state này
  // const [customers, setCustomers] = useState<Customer[]>([]); // Không sử dụng, dữ liệu customers được lấy và xử lý trong fetchData nhưng không set vào state này

  // Lấy danh sách hóa đơn từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Lấy danh sách hóa đơn
        const invoicesDataFromApi = await getInvoices(); // Assume this returns raw API data (camelCase or PascalCase)

        // Lấy danh sách đặt phòng - Sử dụng API admin để lấy tất cả đặt phòng
        console.log('[DEBUG] Calling admin bookings API...');
        const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        const bookingsDataFromApi: any[] = await handleResponse(bookingsResponse);
        console.log('[DEBUG] Admin bookings API result:', {
          isArray: Array.isArray(bookingsDataFromApi),
          length: bookingsDataFromApi?.length || 0,
          data: bookingsDataFromApi
        });

        // Lấy tất cả khách hàng trước
        console.log('[DEBUG] Fetching all customers...');
        const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        const customersDataFromApi: any[] = await handleResponse(customersResponse);
        console.log('[DEBUG] All customers result:', {
          isArray: Array.isArray(customersDataFromApi),
          length: customersDataFromApi?.length || 0,
          sample: customersDataFromApi?.slice(0, 2)
        });

        const customerMap = new Map<string, Customer>(); // Customer interface uses PascalCase

        // Xử lý tất cả khách hàng vào map
        if (Array.isArray(customersDataFromApi)) {
          customersDataFromApi.forEach((customer: any) => {
            const normalizedCustomer: Customer = {
              MaKh: customer.maKh || customer.MaKh || customer.customerId,
              HoKh: customer.hoKh || customer.HoKh || customer.firstName || "",
              TenKh: customer.tenKh || customer.TenKh || customer.lastName || "",
            };

            if (normalizedCustomer.MaKh) {
              customerMap.set(normalizedCustomer.MaKh, normalizedCustomer);
              console.log(`[DEBUG] Added customer to map: ${normalizedCustomer.MaKh} -> ${normalizedCustomer.HoKh} ${normalizedCustomer.TenKh}`);
            }
          });
        }

        console.log('[DEBUG] Final customer map size:', customerMap.size);
        // console.log("Final customerMap:", Array.from(customerMap.entries())); // DEBUG: Log map entries

        // Kết hợp thông tin khách hàng vào hóa đơn
        const enhancedInvoices = invoicesDataFromApi.map((apiInvoice: any) => {
          // Safely get invoice fields (camelCase or PascalCase)
          const invoiceMaDatPhong = apiInvoice.maDatPhong || apiInvoice.MaDatPhong;

          console.log(`[DEBUG] Processing invoice ${apiInvoice.maHoaDon || apiInvoice.MaHoaDon} with MaDatPhong: ${invoiceMaDatPhong}`);
          console.log(`[DEBUG] Available bookings:`, bookingsDataFromApi.map(b => ({
            maDatPhong: b.maDatPhong || b.MaDatPhong,
            tenKhachHang: b.tenKhachHang || b.TenKhachHang,
            maKH: b.maKH || b.MaKH
          })));

          const bookingMatch = bookingsDataFromApi.find((apiBooking: any) =>
            (apiBooking.maDatPhong || apiBooking.MaDatPhong) === invoiceMaDatPhong
          );

          console.log(`[DEBUG] Found booking match:`, bookingMatch);

          let tenKhachHangDisplay = "Không xác định";
          if (bookingMatch) {
            // Ưu tiên lấy tên trực tiếp từ bookingMatch nếu có
            const directTenKhachHang = bookingMatch.tenKhachHang || bookingMatch.TenKhachHang;
            console.log(`[DEBUG] Direct tenKhachHang from booking:`, directTenKhachHang);

            if (directTenKhachHang && typeof directTenKhachHang === 'string' && directTenKhachHang.trim() !== "" && !directTenKhachHang.includes("Khách hàng (")) {
              tenKhachHangDisplay = directTenKhachHang.trim();
              console.log(`[DEBUG] Using direct name: ${tenKhachHangDisplay}`);
            } else {
              // Fallback: sử dụng customerMap
              const bookingMaKh = bookingMatch.maKH || bookingMatch.MaKH;
              console.log(`[DEBUG] Booking MaKH: ${bookingMaKh}`);
              console.log(`[DEBUG] Available customers in map:`, Array.from(customerMap.entries()));

              if (bookingMaKh) {
                const customer = customerMap.get(bookingMaKh);
                console.log(`[DEBUG] Customer from map:`, customer);

                if (customer) {
                  // Thử nhiều cách khác nhau để lấy tên
                  const hoKh = customer.HoKh || customer.hoKh || "";
                  const tenKh = customer.TenKh || customer.tenKh || "";

                  if (hoKh.trim() !== "" || tenKh.trim() !== "") {
                    tenKhachHangDisplay = `${hoKh} ${tenKh}`.trim();
                    if (tenKhachHangDisplay === "") {
                        tenKhachHangDisplay = `Khách hàng (${customer.MaKh || customer.maKh})`;
                    }
                    console.log(`[DEBUG] Using customer map name: ${tenKhachHangDisplay}`);
                  } else {
                    tenKhachHangDisplay = `Khách hàng (${customer.MaKh || customer.maKh})`;
                    console.log(`[DEBUG] Using customer ID: ${tenKhachHangDisplay}`);
                  }
                } else {
                  // Thử tìm trực tiếp trong customersDataFromApi
                  const directCustomer = customersDataFromApi.find((c: any) =>
                    (c.maKh || c.MaKh) === bookingMaKh
                  );
                  console.log(`[DEBUG] Direct customer search result:`, directCustomer);

                  if (directCustomer) {
                    const hoKh = directCustomer.HoKh || directCustomer.hoKh || "";
                    const tenKh = directCustomer.TenKh || directCustomer.tenKh || "";
                    tenKhachHangDisplay = `${hoKh} ${tenKh}`.trim();
                    if (tenKhachHangDisplay === "") {
                      tenKhachHangDisplay = `Khách hàng (${directCustomer.MaKh || directCustomer.maKh})`;
                    }
                    console.log(`[DEBUG] Using direct customer name: ${tenKhachHangDisplay}`);
                  } else {
                    tenKhachHangDisplay = `Khách hàng (ID: ${bookingMaKh})`;
                    console.log(`[DEBUG] Using booking ID: ${tenKhachHangDisplay}`);
                  }
                }
              }
            }
          } else {
            console.log(`[DEBUG] No booking found for MaDatPhong: ${invoiceMaDatPhong}`);
          }

          console.log(`[DEBUG] Final tenKhachHangDisplay: ${tenKhachHangDisplay}`);

          const finalTongTien = apiInvoice.tongTien || apiInvoice.TongTien || 0;
          const finalTrangThai = apiInvoice.trangThai || apiInvoice.TrangThai || "Chưa thanh toán";
          const finalDaThanhToan = finalTrangThai === "Đã thanh toán" ? finalTongTien : 0;
          const finalConThieu = Math.max(0, finalTongTien - finalDaThanhToan);

          // Map to Invoice interface (PascalCase)
          return {
            MaHoaDon: apiInvoice.maHoaDon || apiInvoice.MaHoaDon,
            MaDatPhong: invoiceMaDatPhong,
            MaKM: apiInvoice.maKM || apiInvoice.MaKM,
            TenKhuyenMai: apiInvoice.tenKhuyenMai || apiInvoice.TenKhuyenMai,
            GiamGiaLoaiKM: apiInvoice.giamGiaLoaiKM || apiInvoice.GiamGiaLoaiKM,
            GiamGiaLoaiKH: apiInvoice.giamGiaLoaiKH || apiInvoice.GiamGiaLoaiKH,
            TongTien: finalTongTien,
            TrangThai: finalTrangThai,
            NgayTao: apiInvoice.ngayTao || apiInvoice.NgayTao,
            NgaySua: apiInvoice.ngaySua || apiInvoice.NgaySua,
            tenKhachHang: tenKhachHangDisplay,
            soTienDaThanhToan: finalDaThanhToan,
            soTienConThieu: finalConThieu,
          } as Invoice; // Assert as Invoice type
        });

        setInvoices(enhancedInvoices);
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

  // Khi mở modal Thêm mới
  const openAddModal = () => {
    // Chuyển hướng trực tiếp vì form thêm hóa đơn phức tạp hơn
    window.location.href = `/admin/invoices/create`;
  };

  // Khi mở modal Sửa
  const openEditModal = (invoice: Invoice) => {
    setForm({
      MaHoaDon: invoice.MaHoaDon,
      MaDatPhong: invoice.MaDatPhong,
      TongTien: invoice.TongTien,
      TrangThai: invoice.TrangThai,
      MaKM: invoice.MaKM,
      TenKhuyenMai: invoice.TenKhuyenMai,
      GiamGiaLoaiKM: invoice.GiamGiaLoaiKM,
      GiamGiaLoaiKH: invoice.GiamGiaLoaiKH,
      NgayTao: invoice.NgayTao,
      soTienDaThanhToan: invoice.soTienDaThanhToan,
      soTienConThieu: invoice.soTienConThieu,
    });
    setEditInvoice(invoice);
  };

  // Khi mở modal Xem
  const openViewModal = (invoice: Invoice) => {
    setViewInvoice(invoice);
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: (name === 'TongTien' || name === 'GiamGiaLoaiKM' || name === 'GiamGiaLoaiKH' || name === 'soTienDaThanhToan') ?
        Number(value) : value
    }));
  };

  // Xử lý submit Thêm mới - đã chuyển hướng
  // const handleAdd = (e: React.FormEvent) => { ... };

  // Xử lý submit Sửa (chỉ trạng thái)
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.MaHoaDon || form.TrangThai === undefined) {
      alert("Thông tin không hợp lệ để cập nhật trạng thái.");
      return;
    }

    try {
      await updateInvoiceStatus(form.MaHoaDon, form.TrangThai);

      // Cập nhật danh sách hóa đơn
      setInvoices(invoices.map(inv =>
        inv.MaHoaDon === form.MaHoaDon ? { ...inv, TrangThai: form.TrangThai as string } : inv
      ));
      setEditInvoice(null);
      alert("Cập nhật trạng thái hóa đơn thành công!");
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error updating invoice status:", error);
    }
  };

  // Xử lý xóa hóa đơn
  const handleDelete = async (maHoaDon: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) {
      try {
        await deleteInvoice(maHoaDon);
        setInvoices(invoices.filter(inv => inv.MaHoaDon !== maHoaDon));
      } catch (err) {
        const error = err as Error;
        alert(`Lỗi: ${error.message}`);
        console.error("Error deleting invoice:", error);
      }
    }
  };

  // Xuất hóa đơn PDF
  const handleExportPDF = (invoice: Invoice) => {
    window.open(`/admin/invoices/export?id=${invoice.MaHoaDon}`, '_blank');
  };

  // Lọc theo search
  const filtered = invoices.filter(inv =>
    (inv.tenKhachHang || '').toLowerCase().includes(search.toLowerCase()) ||
    inv.MaHoaDon.toLowerCase().includes(search.toLowerCase()) ||
    inv.MaDatPhong.toLowerCase().includes(search.toLowerCase())
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
            className={styles.search}
            type="text"
            placeholder="Tìm kiếm khách hàng, mã hóa đơn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className={styles.viewBtn}
            onClick={() => window.location.reload()}
            title="Làm mới dữ liệu"
          >
            🔄 Làm mới
          </button>
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
                <th>Mã ĐP</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Đã thanh toán</th>
                <th>Còn lại</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
                <tr><td colSpan={9} className={styles.noData}>Không có dữ liệu hóa đơn</td></tr>
          ) : filtered.map(invoice => (
                <tr key={invoice.MaHoaDon}>
                  <td style={{fontWeight: '600', color: '#2563eb'}}>{invoice.MaHoaDon}</td>
                  <td style={{fontWeight: '600', color: '#7c3aed'}}>{invoice.MaDatPhong}</td>
                  <td>{invoice.tenKhachHang}</td>
                  <td><span className={styles.amount}>{formatCurrency(invoice.TongTien)}</span></td>
                  <td><span className={styles['amount-paid']}>{formatCurrency(invoice.soTienDaThanhToan || 0)}</span></td>
                  <td><span className={styles['amount-remaining']}>{formatCurrency(invoice.soTienConThieu || 0)}</span></td>
                  <td>
                    <span className={`${styles.status} ${styles[`status-${invoice.TrangThai?.toLowerCase().replace(/\s+/g, '-')}`]}`}>
                      {invoice.TrangThai}
                    </span>
                  </td>
                  <td>{invoice.NgayTao ? new Date(invoice.NgayTao).toLocaleDateString('vi-VN') : 'N/A'}</td>
              <td style={{whiteSpace:'nowrap'}}>
                    <button className={styles.viewBtn} onClick={() => openViewModal(invoice)}>Xem</button>
                <button className={styles.editBtn} onClick={() => openEditModal(invoice)}>Sửa</button>
                    <button className={styles.pdfBtn} onClick={() => handleExportPDF(invoice)}>PDF</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(invoice.MaHoaDon)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      )}

      {/* Modal Thêm mới */}
      {/* {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Thêm hóa đơn</h3>
            <form onSubmit={openAddModal} autoComplete="off">
              <p style={{marginBottom:12}}>Hóa đơn sẽ được tạo dựa trên thông tin đặt phòng.</p>
              <div style={{marginTop: 12, display:'flex', gap:8}}>
                <button type="submit" className={styles.editBtn}>Tiếp tục</button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {/* Modal Sửa */}
      {editInvoice && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa hóa đơn #{form.MaHoaDon}</h3>
            <form onSubmit={handleEdit} autoComplete="off">
              <div className={styles.formRow}>
                <label>Mã Hóa Đơn:</label>
                <span>{form.MaHoaDon}</span>
              </div>
              <div className={styles.formRow}>
                <label>Mã Đặt Phòng:</label>
                <span>{form.MaDatPhong}</span>
              </div>
              <div className={styles.formRow}>
                <label>Tổng tiền:</label>
                <span>{formatCurrency(form.TongTien || 0)}</span>
              </div>
              <div className={styles.formRow}>
                <label>Khuyến mãi:</label>
                <span>{form.TenKhuyenMai || "Không có"}{form.GiamGiaLoaiKM ? ` (-${formatCurrency(form.GiamGiaLoaiKM)})` : ""}</span>
              </div>
              <div className={styles.formRow}>
                <label>Giảm giá theo KH:</label>
                <span>{form.GiamGiaLoaiKH ? `${formatCurrency(form.GiamGiaLoaiKH)}` : "Không có"}</span>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="TrangThai">Trạng thái:</label>
                <select
                  id="TrangThai"
                  name="TrangThai"
                  value={form.TrangThai || ""}
                  onChange={handleChange}
                >
                  <option value="Chưa thanh toán">Chưa thanh toán</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
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
            <h3>Chi tiết hóa đơn #{viewInvoice.MaHoaDon}</h3>
            <div className={styles.invoiceDetails}>
              <div className={styles.detailRow}>
                <strong>Khách hàng:</strong>
                <span>{viewInvoice.tenKhachHang || "Không xác định"}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Mã đặt phòng:</strong>
                <span>{viewInvoice.MaDatPhong}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Tổng tiền:</strong>
                <span>{formatCurrency(viewInvoice.TongTien || 0)} VNĐ</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Đã thanh toán:</strong>
                <span>{formatCurrency(viewInvoice.soTienDaThanhToan || 0)} VNĐ</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Còn thiếu:</strong>
                <span>{formatCurrency(viewInvoice.soTienConThieu || 0)} VNĐ</span>
              </div>
              {viewInvoice.MaKM && (
                <div className={styles.detailRow}>
                  <strong>Khuyến mãi:</strong>
                  <span>{viewInvoice.TenKhuyenMai || viewInvoice.MaKM}</span>
                </div>
              )}
              {viewInvoice.GiamGiaLoaiKM && viewInvoice.GiamGiaLoaiKM > 0 && (
                <div className={styles.detailRow}>
                  <strong>Giảm giá KM:</strong>
                  <span>{viewInvoice.GiamGiaLoaiKM}%</span>
                </div>
              )}
              {viewInvoice.GiamGiaLoaiKH && viewInvoice.GiamGiaLoaiKH > 0 && (
                <div className={styles.detailRow}>
                  <strong>Giảm giá KH:</strong>
                  <span>{viewInvoice.GiamGiaLoaiKH}%</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <strong>Trạng thái:</strong>
                <span
                  className={`${styles.status} ${
                    viewInvoice.TrangThai === "Đã thanh toán" ? styles["status-paid"] :
                    viewInvoice.TrangThai === "Chưa thanh toán" ? styles["status-unpaid"] : styles["status"]
                  }`}
                >
                  {viewInvoice.TrangThai || "N/A"}
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>Ngày tạo:</strong>
                <span>{viewInvoice.NgayTao ? new Date(viewInvoice.NgayTao).toLocaleString('vi-VN') : "N/A"}</span>
              </div>
              {viewInvoice.NgaySua && (
                <div className={styles.detailRow}>
                  <strong>Cập nhật lần cuối:</strong>
                  <span>{new Date(viewInvoice.NgaySua).toLocaleString('vi-VN')}</span>
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