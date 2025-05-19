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
import { getInvoices } from '../../../lib/api';

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

interface RevenueData {
  date: string;
  amount: number;
}

export default function EmployeeReportPage() {
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

  // Lấy dữ liệu doanh thu khi thay đổi khoảng thời gian
  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [startDate, endDate]);

  // Hàm lấy dữ liệu doanh thu từ API
  const fetchRevenueData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Lấy tất cả hóa đơn và tính toán
      const invoices = await getInvoices();
      
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
          invoice.ngayTao && 
          invoice.trangThai === "Đã thanh toán" &&
          invoice.tongTien
        ) {
          const invoiceDate = new Date(invoice.ngayTao);
          const dateString = invoiceDate.toISOString().split('T')[0];
          
          // Kiểm tra nếu ngày nằm trong khoảng đã chọn
          if (invoiceDate >= startDateObj && invoiceDate <= endDateObj) {
            // Tìm ngày trong mảng và cộng dồn doanh thu
            const dateIndex = dateArray.findIndex(item => item.date === dateString);
            if (dateIndex !== -1) {
              dateArray[dateIndex].amount += invoice.tongTien;
            }
          }
        }
      });
      
      setRevenueData(dateArray);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu doanh thu");
      console.error('Error fetching revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          callback: function(this: any, value: any) {
            return value.toLocaleString('vi-VN') + 'đ';
          }
        }
      }
    }
  };

  // Tính toán các thống kê
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const averageRevenue = totalRevenue / (revenueData.length || 1);
  const maxRevenue = Math.max(...(revenueData.map(item => item.amount).length ? revenueData.map(item => item.amount) : [0]));

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
          <div style={{marginBottom:24, maxHeight:400, padding:'16px 0'}}>
            <Line 
              options={options} 
              data={chartData} 
            />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:20}}>
            <div style={{background:'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)', padding:20, borderRadius:8, color:'white', boxShadow:'0 4px 6px rgba(0, 0, 0, 0.1)'}}>
              <h3 style={{margin:'0 0 10px 0', fontSize:'1rem'}}>Tổng doanh thu</h3>
              <div style={{fontSize:'1.6rem', fontWeight:'bold'}}>
                {totalRevenue.toLocaleString('vi-VN')}đ
              </div>
            </div>
            
            <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding:20, borderRadius:8, color:'white', boxShadow:'0 4px 6px rgba(0, 0, 0, 0.1)'}}>
              <h3 style={{margin:'0 0 10px 0', fontSize:'1rem'}}>Doanh thu trung bình/ngày</h3>
              <div style={{fontSize:'1.6rem', fontWeight:'bold'}}>
                {Math.round(averageRevenue).toLocaleString('vi-VN')}đ
              </div>
            </div>
            
            <div style={{background:'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)', padding:20, borderRadius:8, color:'white', boxShadow:'0 4px 6px rgba(0, 0, 0, 0.1)'}}>
              <h3 style={{margin:'0 0 10px 0', fontSize:'1rem'}}>Doanh thu cao nhất</h3>
              <div style={{fontSize:'1.6rem', fontWeight:'bold'}}>
                {maxRevenue.toLocaleString('vi-VN')}đ
              </div>
            </div>
          </div>
          
          <div style={{marginTop:32}}>
            <h3 style={{margin:'0 0 16px 0', fontSize:'1.2rem', fontWeight:600}}>Chi tiết doanh thu</h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem'}}>
                <thead>
                  <tr>
                    <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Ngày</th>
                    <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Doanh thu (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((data, index) => (
                    <tr key={index} style={{borderBottom:'1px solid #e5e7eb'}}>
                      <td style={{padding:'12px 10px'}}>{new Date(data.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{padding:'12px 10px'}}>{data.amount.toLocaleString('vi-VN')}đ</td>
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