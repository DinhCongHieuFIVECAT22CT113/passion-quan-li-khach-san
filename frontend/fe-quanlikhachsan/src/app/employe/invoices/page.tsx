"use client";
import React, { useState, useEffect } from "react";
import { getEmployeeInvoices, createEmployeeInvoice, updateInvoiceStatus, getEmployeeBookings, getServices, getAccountantInvoices, updateAccountantInvoiceStatus } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

interface Invoice {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
  note: string;
}

interface Service {
  maDv: string;
  tenDv: string;
  moTa: string;
  giaTien: number;
}

interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  roomId: string;
  roomName: string;
  status?: string;
}

// Hàm định dạng số tùy chỉnh để tránh lỗi hydration
const formatNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function InvoiceManager() {
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    bookingId: "",
    paymentMethod: "Tiền mặt",
    services: [] as { serviceId: string; serviceName: string; quantity: number; price: number }[],
    note: ""
  });
  const [serviceInput, setServiceInput] = useState({ serviceId: "", quantity: 1 });

  // Lấy dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      // Đợi auth loading xong
      if (authLoading) return;

      try {
        setLoading(true);

        // Lấy danh sách hóa đơn - sử dụng API phù hợp với role
        const invoicesData = user?.role === 'R03'
          ? await getAccountantInvoices()
          : await getEmployeeInvoices();
          
        // Lấy trạng thái hóa đơn từ localStorage nếu có
        let savedInvoiceStatuses: Record<string, string> = {};
        if (typeof window !== 'undefined') {
          try {
            // Sử dụng localStorage khác nhau cho nhân viên và kế toán
            const storageKey = user?.role === 'R03' ? 'accountantInvoiceStatuses' : 'invoiceStatuses';
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
              savedInvoiceStatuses = JSON.parse(savedData);
            }
          } catch (e) {
            console.error('Lỗi khi parse trạng thái hóa đơn từ localStorage:', e);
          }
        }
        
        // Áp dụng trạng thái đã lưu
        const updatedInvoices = invoicesData.map(invoice => {
          const savedStatus = savedInvoiceStatuses[invoice.id];
          return savedStatus ? { ...invoice, status: savedStatus } : invoice;
        });
        
        setInvoices(updatedInvoices);

        // Chỉ lấy services và bookings nếu không phải kế toán (kế toán chỉ cần hóa đơn)
        if (user?.role !== 'R03') {
          // Lấy danh sách dịch vụ
          const servicesData = await getServices();
          setServices(servicesData);

          // Lấy danh sách đặt phòng
          const bookingsData = await getEmployeeBookings();
          // Chỉ lấy các đặt phòng chưa thanh toán
          const unpaidBookings = bookingsData.filter(
            (b: Booking) => b.status !== 'Đã hủy' && b.status !== 'Đã trả phòng'
          );
          setBookings(unpaidBookings);
        }

        setError(null);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Lỗi khi lấy dữ liệu:", error);

        // Xử lý thông báo lỗi chi tiết hơn
        if (error.message.includes('Failed to fetch')) {
          setError("Không thể kết nối đến server backend. Vui lòng kiểm tra:\n" +
                   "1. Server backend có đang chạy trên http://localhost:5009 không?\n" +
                   "2. Cấu hình CORS có đúng không?\n" +
                   "3. Kết nối mạng có ổn định không?\n\n" +
                   "Hiện tại đang sử dụng dữ liệu mẫu để demo.");
        } else {
          setError(error.message || "Không thể lấy dữ liệu");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]); // Thêm dependencies

  // Format date để hiển thị
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Modal thêm mới hóa đơn
  const openAddModal = () => {
    setForm({
      bookingId: "",
      paymentMethod: "Tiền mặt",
      services: [],
      note: ""
    });
    setServiceInput({ serviceId: "", quantity: 1 });
    setFormError(null);
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  // Xử lý thay đổi form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Xử lý thay đổi dịch vụ đầu vào
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceInput({ ...serviceInput, [name]: name === "quantity" ? Number(value) : value });
  };

  // Thêm dịch vụ vào hóa đơn
  const addService = () => {
    if (!serviceInput.serviceId) return;

    const selectedService = services.find(s => s.maDv === serviceInput.serviceId);
    if (!selectedService) return;

    const existingServiceIndex = form.services.findIndex(s => s.serviceId === serviceInput.serviceId);

    if (existingServiceIndex >= 0) {
      // Nếu dịch vụ đã tồn tại, cập nhật số lượng
      const updatedServices = [...form.services];
      updatedServices[existingServiceIndex].quantity += serviceInput.quantity;
      setForm({...form, services: updatedServices});
    } else {
      // Nếu chưa có, thêm mới
      setForm({
        ...form,
        services: [
          ...form.services,
          {
            serviceId: selectedService.maDv,
            serviceName: selectedService.tenDv,
            quantity: serviceInput.quantity,
            price: selectedService.giaTien
          }
        ]
      });
    }

    setServiceInput({ serviceId: "", quantity: 1 });
  };

  // Xoá dịch vụ khỏi hóa đơn
  const removeService = (idx: number) => {
    setForm({ ...form, services: form.services.filter((_, i) => i !== idx) });
  };

  // Xử lý thay đổi trạng thái hóa đơn
  const handleStatusChange = async (id: string, status: string) => {
    // Cho phép cả Kế toán và các role khác có quyền
    if (!user?.permissions.canManageInvoices && user?.role !== 'R03') {
      setError("Bạn không có quyền thực hiện hành động này.");
      return;
    }
    try {
      setLoading(true);

      // Cập nhật trạng thái trong state trước để UI phản hồi ngay lập tức
      setInvoices(invoices.map(i => i.id === id ? { ...i, status } : i));

      // Lưu trạng thái vào localStorage để duy trì khi tải lại trang
      if (typeof window !== 'undefined') {
        const storageKey = user?.role === 'R03' ? 'accountantInvoiceStatuses' : 'invoiceStatuses';
        const savedInvoiceStatuses = JSON.parse(localStorage.getItem(storageKey) || '{}');
        savedInvoiceStatuses[id] = status;
        localStorage.setItem(storageKey, JSON.stringify(savedInvoiceStatuses));
      }

      // Sử dụng API phù hợp với role
      try {
        if (user?.role === 'R03') {
          const result = await updateAccountantInvoiceStatus(id, status);
          if (result.success) {
            setError(null);
            console.log('Cập nhật trạng thái thành công!');
          }
        } else {
          // Sử dụng API cho nhân viên khác
          const result = await updateInvoiceStatus(id, status);
          if (result.success) {
            setError(null);
            console.log('Cập nhật trạng thái thành công!');
          }
        }
      } catch (apiError) {
        console.error("Lỗi API khi cập nhật trạng thái:", apiError);
        // Không hiển thị lỗi cho người dùng vì đã cập nhật UI
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Lỗi khi cập nhật trạng thái hóa đơn:", error);
      setError(error.message || "Không thể cập nhật trạng thái hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi form tạo hóa đơn
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kế toán không được phép tạo hóa đơn mới, chỉ được xem và cập nhật trạng thái
    if (user?.role === 'R03') {
      setFormError("Kế toán không có quyền tạo hóa đơn mới.");
      return;
    }
    // Kiểm tra quyền cho các role khác
    if (!user?.permissions.canManageInvoices) {
      setFormError("Bạn không có quyền tạo hóa đơn.");
      return;
    }

    try {
      // Validate form
      if (!form.bookingId) {
        setFormError("Vui lòng chọn đặt phòng");
        return;
      }

      setLoading(true);
      setFormError(null);

      // Tính tổng tiền
      const totalAmount = form.services.reduce((sum, s) => sum + s.price * s.quantity, 0);

      // Tạo chi tiết dịch vụ
      const serviceDetails = form.services.map(s => ({
        maDv: s.serviceId,
        soLuong: s.quantity,
        donGia: s.price
      }));

      // Chuẩn bị dữ liệu để gửi đi
      const invoiceData = {
        bookingId: form.bookingId,
        totalAmount: totalAmount,
        paymentMethodId: form.paymentMethod === "Tiền mặt" ? "TM" : "CK",
        status: "Chưa thanh toán",
        notes: form.note || "",
        issueDate: new Date().toISOString(),
        serviceDetails: serviceDetails.map(s => ({
          serviceId: s.maDv,
          quantity: s.soLuong,
          price: s.donGia
        }))
      };

      // Gọi API để tạo hóa đơn mới
      await createEmployeeInvoice(invoiceData);

      // Làm mới danh sách hóa đơn
      const newInvoices = await getEmployeeInvoices();
      setInvoices(newInvoices);

      // Đóng modal
      closeModal();

    } catch (err: unknown) {
      const error = err as Error;
      console.error("Lỗi khi tạo hóa đơn:", error);
      setFormError(error.message || "Không thể tạo hóa đơn mới");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý in hóa đơn
  const handlePrint = (inv: Invoice) => {
    // Cho phép cả Kế toán và các role khác có quyền
    if (!user?.permissions.canManageInvoices && user?.role !== 'R03') {
      console.error("User does not have permission to print invoices.");
      return;
    }
    const printContent = document.getElementById(`invoice-print-${inv.id}`);
    if (!printContent) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    // Thêm CSS cho trang in
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 20px; }
            .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-details div { margin-bottom: 5px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .invoice-table th, .invoice-table td { border: 1px solid #e0e0e0; padding: 10px; text-align: left; }
            .invoice-table th { background-color: #f5f5f5; }
            .invoice-total { text-align: right; font-weight: bold; margin-top: 20px; font-size: 18px; }
            .invoice-footer { text-align: center; margin-top: 40px; color: #666; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContent.innerHTML}
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">In hóa đơn</button>
            <button onclick="window.close();" style="padding: 10px 20px; background: #e5e7eb; color: #232946; border: none; border-radius: 5px; margin-left: 10px; cursor: pointer;">Đóng</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
  };
  
  // Xử lý xuất hóa đơn ra PDF
  const handleExportPDF = (inv: Invoice) => {
    // Cho phép cả Kế toán và các role khác có quyền
    if (!user?.permissions.canManageInvoices && user?.role !== 'R03') {
      console.error("User does not have permission to export invoices.");
      return;
    }
    
    const printContent = document.getElementById(`invoice-print-${inv.id}`);
    if (!printContent) return;
    
    // Tạo một thẻ a để tải file
    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    
    // Tạo URL cho file PDF
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn ${inv.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 20px; }
            .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-details div { margin-bottom: 5px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .invoice-table th, .invoice-table td { border: 1px solid #e0e0e0; padding: 10px; text-align: left; }
            .invoice-table th { background-color: #f5f5f5; }
            .invoice-total { text-align: right; font-weight: bold; margin-top: 20px; font-size: 18px; }
            .invoice-footer { text-align: center; margin-top: 40px; color: #666; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `], { type: 'text/html' });
    
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `hoa-don-${inv.id}.html`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    alert('Đã xuất hóa đơn. Vui lòng mở file bằng trình duyệt và sử dụng chức năng in của trình duyệt để lưu thành PDF.');
  };

  const getStatusBadgeStyle = (status: string) => {
    // ... existing code ...
  };

  if (authLoading) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải...</div>;
  }

  if (loading && invoices.length === 0) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải dữ liệu...</div>;
  }

  // Cho phép cả Kế toán và các role khác có quyền
  if (!user?.permissions.canManageInvoices && user?.role !== 'R03') {
    return <div style={{padding:'24px', textAlign:'center', color: 'red'}}>Bạn không có quyền truy cập chức năng quản lý hóa đơn.</div>;
  }

  return (
    <div style={{maxWidth:1200, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35'}}>Quản lý hóa đơn</h2>
        {(user?.permissions.canManageInvoices && user?.role !== 'R03') && (
          <button
            style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:'1rem', cursor:'pointer'}}
            onClick={openAddModal}
          >
            + Thêm hóa đơn
          </button>
        )}
      </div>

      {error && (
        <div style={{
          color:'#dc2626',
          backgroundColor:'#fef2f2',
          border:'1px solid #fecaca',
          borderRadius:'8px',
          padding:'16px',
          marginBottom:'16px',
          whiteSpace:'pre-line',
          fontSize:'0.95rem',
          lineHeight:'1.5'
        }}>
          <strong>⚠️ Lỗi kết nối:</strong><br/>
          {error}
        </div>
      )}

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Mã HD</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Khách hàng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Mã đặt phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Tổng tiền (VNĐ)</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Ngày lập</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Trạng thái</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={invoice.id || `invoice-row-${index}`} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{invoice.id || 'N/A'}</td>
                <td style={{padding:'12px 10px'}}>{invoice.customerName || 'N/A'}</td>
                <td style={{padding:'12px 10px'}}>{invoice.bookingId || 'N/A'}</td>
                <td style={{padding:'12px 10px'}}>{formatNumber(invoice.amount || 0)}</td>
                <td style={{padding:'12px 10px'}}>{formatDate(invoice.date)}</td>
                <td style={{padding:'12px 10px'}}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    background: invoice.status === 'Đã thanh toán' ? '#dcfce7' : '#fef3c7',
                    color: invoice.status === 'Đã thanh toán' ? '#166534' : '#92400e'
                  }}>
                    {invoice.status || 'N/A'}
                  </span>
                </td>
                <td style={{padding:'12px 10px'}}>
                  <select
                    value={invoice.status || 'Chưa thanh toán'}
                    onChange={e => handleStatusChange(invoice.id, e.target.value)}
                    style={{padding:'6px 10px', marginRight:'8px', borderRadius:6, border:'1.5px solid #e5e7eb', fontWeight:500, fontSize:'0.9rem'}}
                    disabled={loading}
                  >
                    <option value="Chưa thanh toán">Chưa thanh toán</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                  </select>
                  <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                    <button
                      style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:6, padding:'6px 12px', cursor:'pointer'}}
                      onClick={()=>handlePrint(invoice)}
                    >
                      In
                    </button>
                    <button
                      style={{background:'#10b981', color:'#fff', border:'none', borderRadius:6, padding:'6px 12px', cursor:'pointer'}}
                      onClick={()=>handleExportPDF(invoice)}
                    >
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nội dung in hóa đơn */}
      {invoices.map((invoice, index) => (
        <div key={`print-${invoice.id || `invoice-${index}`}`} id={`invoice-print-${invoice.id || `invoice-${index}`}`} style={{display:'none'}}>
          <div className="invoice-container" style={{padding:32, fontFamily:'Arial'}}>
            <div className="invoice-header" style={{textAlign:'center', marginBottom:24}}>
              <h2 style={{fontSize:'24px', fontWeight:'bold', marginBottom:10}}>PASSION HOTEL</h2>
              <h3 style={{fontSize:'20px', fontWeight:'bold', marginBottom:5}}>HÓA ĐƠN THANH TOÁN</h3>
              <p style={{color:'#666', fontSize:'14px'}}>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
            
            <div className="invoice-details" style={{marginBottom:20, borderBottom:'1px solid #eee', paddingBottom:15}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <tbody>
                  <tr>
                    <td style={{padding:'5px 0'}}><strong>Mã hóa đơn:</strong></td>
                    <td style={{padding:'5px 0'}}>{invoice.id || 'N/A'}</td>
                    <td style={{padding:'5px 0'}}><strong>Ngày lập:</strong></td>
                    <td style={{padding:'5px 0'}}>{formatDate(invoice.date)}</td>
                  </tr>
                  <tr>
                    <td style={{padding:'5px 0'}}><strong>Khách hàng:</strong></td>
                    <td style={{padding:'5px 0'}}>{invoice.customerName || 'N/A'}</td>
                    <td style={{padding:'5px 0'}}><strong>Mã đặt phòng:</strong></td>
                    <td style={{padding:'5px 0'}}>{invoice.bookingId || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{padding:'5px 0'}}><strong>Phương thức thanh toán:</strong></td>
                    <td style={{padding:'5px 0'}}>{invoice.paymentMethod || 'Tiền mặt'}</td>
                    <td style={{padding:'5px 0'}}><strong>Trạng thái:</strong></td>
                    <td style={{padding:'5px 0'}}>{invoice.status || 'Chưa thanh toán'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="invoice-items" style={{marginBottom:20}}>
              <h4 style={{marginBottom:10, fontSize:'16px', fontWeight:'bold'}}>Chi tiết dịch vụ</h4>
              <table style={{width:'100%', borderCollapse:'collapse', border:'1px solid #ddd'}}>
                <thead>
                  <tr style={{backgroundColor:'#f5f5f5'}}>
                    <th style={{padding:10, textAlign:'left', border:'1px solid #ddd'}}>Dịch vụ</th>
                    <th style={{padding:10, textAlign:'center', border:'1px solid #ddd'}}>Số lượng</th>
                    <th style={{padding:10, textAlign:'right', border:'1px solid #ddd'}}>Đơn giá (VNĐ)</th>
                    <th style={{padding:10, textAlign:'right', border:'1px solid #ddd'}}>Thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{padding:10, border:'1px solid #ddd'}}>Phòng {invoice.bookingId}</td>
                    <td style={{padding:10, textAlign:'center', border:'1px solid #ddd'}}>1</td>
                    <td style={{padding:10, textAlign:'right', border:'1px solid #ddd'}}>{formatNumber(invoice.amount || 0)}</td>
                    <td style={{padding:10, textAlign:'right', border:'1px solid #ddd'}}>{formatNumber(invoice.amount || 0)}</td>
                  </tr>
                  {/* Các dịch vụ khác sẽ được thêm vào đây */}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{padding:10, textAlign:'right', fontWeight:'bold', border:'1px solid #ddd'}}>Tổng cộng:</td>
                    <td style={{padding:10, textAlign:'right', fontWeight:'bold', border:'1px solid #ddd'}}>{formatNumber(invoice.amount || 0)} VNĐ</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="invoice-notes" style={{marginBottom:20, padding:15, backgroundColor:'#f9f9f9', borderRadius:5}}>
              <p><strong>Ghi chú:</strong> {invoice.note || 'Không có ghi chú'}</p>
            </div>
            
            <div className="invoice-footer" style={{marginTop:30, textAlign:'center', borderTop:'1px solid #eee', paddingTop:20}}>
              <p style={{marginBottom:5}}>Cảm ơn quý khách đã sử dụng dịch vụ của Passion Hotel!</p>
              <p style={{fontSize:'12px', color:'#666'}}>Mọi thắc mắc xin vui lòng liên hệ: 028.1234.5678 | info@passionhotel.com</p>
            </div>
          </div>
        </div>
      ))}

      {/* Modal tạo hóa đơn */}
      {showModal && (
        <div style={{position:'fixed',zIndex:1000,top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px #23294622',padding:'32px 28px 24px 28px',minWidth:340,maxWidth:'95vw',width:'600px'}}>
            <h3 style={{marginTop:0,marginBottom:18,fontSize:'1.3rem',color:'#232946',fontWeight:700}}>Tạo hóa đơn mới</h3>

            {formError && (
              <div style={{padding:'10px 16px', backgroundColor:'#fee2e2', color:'#b91c1c', borderRadius:8, marginBottom:16}}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Đặt phòng <span style={{color:'red'}}>*</span></label>
                <select
                  name="bookingId"
                  value={form.bookingId}
                  onChange={handleChange}
                  required
                  style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                >
                  <option value="">Chọn đặt phòng</option>
                  {bookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.id} - {booking.customerName} - Phòng {booking.roomName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                >
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
              </div>

              <div style={{margin:'10px 0 0 0'}}>
                <label style={{fontWeight:500, color:'#232946'}}>Dịch vụ đã dùng</label>
                <div style={{display:'flex',gap:12,marginTop:6}}>
                  <select
                    name="serviceId"
                    value={serviceInput.serviceId}
                    onChange={handleServiceChange}
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc',flex:2}}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {services.map(service => (
                      <option key={service.maDv} value={service.maDv}>
                        {service.tenDv} ({formatNumber(service.giaTien)} đ)
                      </option>
                    ))}
                  </select>
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    value={serviceInput.quantity}
                    onChange={handleServiceChange}
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc',flex:1}}
                  />
                  <button
                    type="button"
                    onClick={addService}
                    disabled={!serviceInput.serviceId}
                    style={{
                      background:'#2563eb',
                      color:'#fff',
                      border:'none',
                      borderRadius:8,
                      padding:'10px 18px',
                      fontWeight:600,
                      fontSize:'1.08rem',
                      cursor: !serviceInput.serviceId ? 'not-allowed' : 'pointer',
                      opacity: !serviceInput.serviceId ? 0.7 : 1
                    }}
                  >
                    Thêm
                  </button>
                </div>

                {form.services.length > 0 ? (
                  <table style={{width:'100%', borderCollapse:'collapse', marginTop:'16px', fontSize:'0.95rem'}}>
                    <thead>
                      <tr>
                        <th style={{padding:'8px', textAlign:'left', borderBottom:'1px solid #e5e7eb'}}>Dịch vụ</th>
                        <th style={{padding:'8px', textAlign:'center', borderBottom:'1px solid #e5e7eb'}}>Số lượng</th>
                        <th style={{padding:'8px', textAlign:'right', borderBottom:'1px solid #e5e7eb'}}>Đơn giá</th>
                        <th style={{padding:'8px', textAlign:'right', borderBottom:'1px solid #e5e7eb'}}>Thành tiền</th>
                        <th style={{padding:'8px', textAlign:'center', borderBottom:'1px solid #e5e7eb'}}>Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.services.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{padding:'8px', borderBottom:'1px solid #f3f4f6'}}>{s.serviceName}</td>
                          <td style={{padding:'8px', textAlign:'center', borderBottom:'1px solid #f3f4f6'}}>{s.quantity}</td>
                          <td style={{padding:'8px', textAlign:'right', borderBottom:'1px solid #f3f4f6'}}>{formatNumber(s.price)}</td>
                          <td style={{padding:'8px', textAlign:'right', borderBottom:'1px solid #f3f4f6'}}>{formatNumber(s.price * s.quantity)}</td>
                          <td style={{padding:'8px', textAlign:'center', borderBottom:'1px solid #f3f4f6'}}>
                            <button
                              type="button"
                              onClick={() => removeService(idx)}
                              style={{background:'#f87171',color:'#fff',border:'none',borderRadius:'50%',width:'24px',height:'24px',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} style={{padding:'8px', textAlign:'right', fontWeight:'bold'}}>Tổng cộng:</td>
                        <td style={{padding:'8px', textAlign:'right', fontWeight:'bold'}}>
                          {formatNumber(form.services.reduce((sum, s) => sum + s.price * s.quantity, 0))}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div style={{margin:'12px 0', fontStyle:'italic', color:'#666'}}>
                    Chưa có dịch vụ nào được thêm vào hóa đơn
                  </div>
                )}
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                  style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                ></textarea>
              </div>

              <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:10}}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{background:'#e5e7eb',color:'#232946',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:500,fontSize:'0.97em',cursor:'pointer'}}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:600,fontSize:'1.08rem',cursor:'pointer'}}
                >
                  {loading ? 'Đang xử lý...' : 'Tạo hóa đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}