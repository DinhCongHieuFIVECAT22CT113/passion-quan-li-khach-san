'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { getEmployeeInvoices, getAccountantReports } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

// Đăng ký các components của ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Định nghĩa kiểu cho hóa đơn từ API getInvoices
interface InvoiceFromApi {
  maHoaDon: string;
  ngayTao?: string; // Hoặc kiểu Date nếu API trả về Date object
  trangThai: string;
  tongTien: number;
  // Thêm các trường khác nếu có từ API
}

interface RevenueData {
  date: string;
  amount: number;
}

export default function EmployeeReportPage() {
  const { user, loading: authLoading } = useAuth();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo ngày bắt đầu và kết thúc mặc định
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Hàm lấy dữ liệu doanh thu từ API, bọc trong useCallback
  const fetchRevenueData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Lấy dữ liệu báo cáo - sử dụng API phù hợp với role
      if (user?.role === 'R03') {
        // Kế toán sử dụng API riêng
        const reportData = await getAccountantReports(startDate, endDate);

        // Chuyển đổi dữ liệu báo cáo thành format cho biểu đồ
        const dateArray: RevenueData[] = [];
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const currentDate = new Date(startDateObj);

        while (currentDate <= endDateObj) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const dayData = reportData.dailyReport[dateKey];

          dateArray.push({
            date: dateKey,
            amount: dayData ? dayData.revenue : 0
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setRevenueData(dateArray);
        return;
      }

      // Các role khác sử dụng logic cũ
      const invoices = await getEmployeeInvoices();

      // Lọc hóa đơn trong khoảng thời gian đã chọn
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59); // Đặt thời gian cuối ngày

      // Tạo mảng các ngày trong khoảng
      const dateArray: RevenueData[] = [];
      const currentDate = new Date(startDateObj);

      while (currentDate <= endDateObj) {
        dateArray.push({
          date: currentDate.toISOString().split('T')[0],
          amount: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Tính tổng doanh thu cho từng ngày
      invoices.forEach((invoice: any) => {
        if (
          invoice.date &&
          invoice.status === "Đã thanh toán" &&
          invoice.amount
        ) {
          const invoiceDate = new Date(invoice.date);
          const dateString = invoiceDate.toISOString().split('T')[0];

          // Kiểm tra nếu ngày nằm trong khoảng đã chọn
          if (invoiceDate >= startDateObj && invoiceDate <= endDateObj) {
            // Tìm ngày trong mảng và cộng dồn doanh thu
            const dateIndex = dateArray.findIndex(item => item.date === dateString);
            if (dateIndex !== -1) {
              dateArray[dateIndex].amount += invoice.amount;
            }
          }
        }
      });

      setRevenueData(dateArray);
    } catch (err) { // Bỏ : any, err sẽ là unknown
      const error = err as Error; // Ép kiểu sang Error
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu doanh thu");
      console.error('Error fetching revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, user]);

  // Lấy dữ liệu doanh thu khi thay đổi khoảng thời gian
  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [startDate, endDate, fetchRevenueData]); // Thêm fetchRevenueData vào dependencies

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: revenueData.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [{
      label: 'Doanh thu theo ngày (VNĐ)',
      data: revenueData.map(item => item.amount),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh thu theo ngày',
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: function(this: unknown, value: string | number) { // Sửa kiểu cho this và value
            if (typeof value === 'number') {
              return value.toLocaleString('vi-VN') + 'đ';
            }
            return value;
          }
        }
      }
    }
  };

  // Tính toán các thống kê
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const averageRevenue = totalRevenue / (revenueData.length || 1);
  const maxRevenue = Math.max(...(revenueData.map(item => item.amount).length ? revenueData.map(item => item.amount) : [0]));

  // Kiểm tra quyền truy cập
  if (authLoading) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải...</div>;
  }

  // Cho phép cả Kế toán và các role khác có quyền
  if (!user?.permissions.canViewReports && user?.role !== 'R03') {
    return <div style={{padding:'24px', textAlign:'center', color: 'red'}}>Bạn không có quyền truy cập báo cáo.</div>;
  }

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 24px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <h1 style={{margin:0, fontSize:'1.8rem', fontWeight:'bold', color:'#232a35'}}>Báo cáo doanh thu</h1>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{padding:'8px 12px', borderRadius:8, border:'1.5px solid #e5e7eb', fontSize:'1rem'}}
          />
          <span>đến</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{padding:'8px 12px', borderRadius:8, border:'1.5px solid #e5e7eb', fontSize:'1rem'}}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{padding:'24px', textAlign:'center'}}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div style={{padding:'24px', color:'red', textAlign:'center'}}>Lỗi: {error}</div>
      ) : (
        <>
          <div style={{
            marginBottom: 32, 
            maxHeight: 400, 
            padding: '24px 16px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
          }}>
            <Line
              options={options}
              data={chartData}
            />
          </div>

          <div style={{
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: 20,
            marginBottom: 20
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)', 
              padding: 20, 
              borderRadius: 12, 
              color: 'white', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease-in-out',
              cursor: 'default',
              ':hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <h3 style={{margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 500}}>Tổng doanh thu</h3>
              <div style={{fontSize: '1.7rem', fontWeight: 'bold', letterSpacing: '0.5px'}}>
                {totalRevenue.toLocaleString('vi-VN')}đ
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              padding: 20, 
              borderRadius: 12, 
              color: 'white', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease-in-out',
              cursor: 'default'
            }}>
              <h3 style={{margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 500}}>Doanh thu trung bình/ngày</h3>
              <div style={{fontSize: '1.7rem', fontWeight: 'bold', letterSpacing: '0.5px'}}>
                {Math.round(averageRevenue).toLocaleString('vi-VN')}đ
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)', 
              padding: 20, 
              borderRadius: 12, 
              color: 'white', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease-in-out',
              cursor: 'default'
            }}>
              <h3 style={{margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 500}}>Doanh thu cao nhất</h3>
              <div style={{fontSize: '1.7rem', fontWeight: 'bold', letterSpacing: '0.5px'}}>
                {maxRevenue.toLocaleString('vi-VN')}đ
              </div>
            </div>
          </div>

          <div style={{marginTop:32}}>
            <h3 style={{margin:'0 0 16px 0', fontSize:'1.3rem', fontWeight:600, color:'#1f2937'}}>Chi tiết doanh thu</h3>
            <div style={{overflowX:'auto', borderRadius:12, boxShadow:'0 2px 10px rgba(0, 0, 0, 0.08)'}}>
              <table style={{
                width:'100%', 
                borderCollapse:'separate', 
                borderSpacing:0, 
                background:'#fff', 
                fontSize:'1rem',
                borderRadius:12,
                overflow:'hidden'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      padding:'16px 20px', 
                      background:'#f8fafc', 
                      fontWeight:600, 
                      textAlign:'left',
                      borderBottom:'2px solid #e2e8f0',
                      color:'#334155'
                    }}>Ngày</th>
                    <th style={{
                      padding:'16px 20px', 
                      background:'#f8fafc', 
                      fontWeight:600, 
                      textAlign:'right',
                      borderBottom:'2px solid #e2e8f0',
                      color:'#334155'
                    }}>Doanh thu (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((data, index) => (
                    <tr key={index} style={{
                      borderBottom: index === revenueData.length - 1 ? 'none' : '1px solid #e5e7eb',
                      background: index % 2 === 0 ? '#fff' : '#f9fafb'
                    }}>
                      <td style={{padding:'14px 20px'}}>{new Date(data.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{
                        padding:'14px 20px', 
                        textAlign:'right', 
                        fontWeight: data.amount > 0 ? 500 : 400,
                        color: data.amount > 0 ? '#047857' : '#6b7280'
                      }}>
                        {data.amount.toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}