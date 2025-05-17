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
import styles from './Reports.module.css';
import { calculateRevenue, getInvoices } from '../../../lib/api';

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

export default function RevenueReport() {
  const [timeRange, setTimeRange] = useState<'day' | 'month'>('day');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo ngày bắt đầu và kết thúc mặc định
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(lastDayOfMonth.toISOString().split('T')[0]);
  }, []);

  // Lấy dữ liệu doanh thu khi thay đổi khoảng thời gian
  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [startDate, endDate, timeRange]);

  // Hàm lấy dữ liệu doanh thu từ API
  const fetchRevenueData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (timeRange === 'month') {
        // Trường hợp theo tháng
        const startMonth = new Date(startDate).getMonth() + 1;
        const startYear = new Date(startDate).getFullYear();
        const endMonth = new Date(endDate).getMonth() + 1;
        const endYear = new Date(endDate).getFullYear();
        
        const data: RevenueData[] = [];
        
        // Tạo mảng các tháng cần lấy dữ liệu
        let currentMonth = startMonth;
        let currentYear = startYear;
        
        while (
          new Date(currentYear, currentMonth - 1, 1) <= 
          new Date(endYear, endMonth - 1, 1)
        ) {
          try {
            // Gọi API tính doanh thu theo tháng
            const monthlyRevenue = await calculateRevenue(currentMonth, currentYear);
            
            data.push({
              date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
              amount: monthlyRevenue || 0
            });
          } catch (err) {
            console.error(`Lỗi khi lấy doanh thu tháng ${currentMonth}/${currentYear}:`, err);
            data.push({
              date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
              amount: 0
            });
          }
          
          // Tăng tháng
          if (currentMonth === 12) {
            currentMonth = 1;
            currentYear++;
          } else {
            currentMonth++;
          }
        }
        
        setRevenueData(data);
      } else {
        // Trường hợp theo ngày - lấy tất cả hóa đơn và tính toán
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
      }
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
      return timeRange === 'day' 
        ? `${date.getDate()}/${date.getMonth() + 1}`
        : `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
    }),
    datasets: [{
      label: `Doanh thu theo ${timeRange === 'day' ? 'ngày' : 'tháng'} (VNĐ)`,
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
        text: `Doanh thu theo ${timeRange === 'day' ? 'ngày' : 'tháng'}`,
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Báo cáo doanh thu</h1>
        <div className={styles.controls}>
          <div className={styles.dateRange}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
            <span>đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <button 
            className={`${styles.timeButton} ${timeRange === 'day' ? styles.active : ''}`}
            onClick={() => setTimeRange('day')}
          >
            Theo ngày
          </button>
          <button 
            className={`${styles.timeButton} ${timeRange === 'month' ? styles.active : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Theo tháng
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className={styles.error}>Lỗi: {error}</div>
      ) : (
        <>
          <div className={styles.chartContainer}>
            <Line 
              options={options} 
              data={chartData} 
            />
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3>Tổng doanh thu</h3>
              <p className={styles.amount}>
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className={styles.summaryCard}>
              <h3>Doanh thu trung bình</h3>
              <p className={styles.amount}>
                {Math.round(averageRevenue).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className={styles.summaryCard}>
              <h3>Doanh thu cao nhất</h3>
              <p className={styles.amount}>
                {maxRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 