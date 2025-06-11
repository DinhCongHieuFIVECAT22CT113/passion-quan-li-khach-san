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
import { FaChartLine, FaMoneyBillWave, FaChartBar, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const monthlyRevenueResult = await calculateRevenue(currentMonth, currentYear);
            // Giả sử monthlyRevenueResult có thể là số trực tiếp hoặc một object chứa giá trị
            const amount = typeof monthlyRevenueResult === 'number' ? monthlyRevenueResult : (monthlyRevenueResult?.value || 0);
            console.log(`[Month fetch] Month: ${currentMonth}/${currentYear}, API Result:`, monthlyRevenueResult, "Parsed amount:", amount);
            
            data.push({
              date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
              amount: amount // Sử dụng amount đã parse
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
        invoices.forEach((invoice: { ngayTao?: string; trangThai?: string; tongTien?: number }) => {
          if (
            invoice.ngayTao && 
            invoice.trangThai === "Đã thanh toán" &&
            typeof invoice.tongTien === 'number' // Đảm bảo tongTien là số
          ) {
            const invoiceDate = new Date(invoice.ngayTao);
            const dateString = invoiceDate.toISOString().split('T')[0];
            
            // Kiểm tra nếu ngày nằm trong khoảng đã chọn
            if (invoiceDate >= startDateObj && invoiceDate <= endDateObj) {
              // Tìm ngày trong mảng và cộng dồn doanh thu
              const dateIndex = dateArray.findIndex(item => item.date === dateString);
              if (dateIndex !== -1) {
                dateArray[dateIndex].amount += invoice.tongTien; // tongTien đã được kiểm tra là số
              }
            }
          } else if (invoice.tongTien && typeof invoice.tongTien !== 'number') {
            console.warn("[Day fetch] Invoice with invalid tongTien (not a number):", invoice);
          }
        });
        
        console.log("[Day fetch] Processed daily revenueData:", JSON.stringify(dateArray, null, 2));
        setRevenueData(dateArray);
      }
    } catch (err) {
      const error = err as Error;
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
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      fill: true
    }]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `Biểu đồ doanh thu theo ${timeRange === 'day' ? 'ngày' : 'tháng'}`,
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        padding: 12,
        borderColor: '#e2e8f0',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Doanh thu: ${context.parsed.y.toLocaleString('vi-VN')}đ`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          },
          padding: 10,
          callback: function(value: string | number) {
            if (typeof value === 'number') {
              return value.toLocaleString('vi-VN') + 'đ';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          padding: 10
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // Tính toán các thống kê
  const validRevenueData = revenueData.filter(item => typeof item.amount === 'number' && !isNaN(item.amount));
  const totalRevenue = validRevenueData.reduce((sum, item) => sum + item.amount, 0);
  const averageRevenue = validRevenueData.length > 0 ? totalRevenue / validRevenueData.length : 0;
  const maxRevenue = validRevenueData.length > 0 ? Math.max(...validRevenueData.map(item => item.amount)) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1><FaChartLine style={{ marginRight: '12px', verticalAlign: 'middle' }} /> Báo cáo doanh thu</h1>
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
            <FaCalendarAlt style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Theo ngày
          </button>
          <button 
            className={`${styles.timeButton} ${timeRange === 'month' ? styles.active : ''}`}
            onClick={() => setTimeRange('month')}
          >
            <FaChartBar style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Theo tháng
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className={styles.error}>
          <FaExclamationTriangle /> Lỗi: {error}
        </div>
      ) : (
        <>
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3><FaMoneyBillWave /> Tổng doanh thu</h3>
              <p className={styles.amount}>{totalRevenue.toLocaleString('vi-VN')}</p>
            </div>
            <div className={styles.summaryCard}>
              <h3><FaChartBar /> Doanh thu trung bình</h3>
              <p className={styles.amount}>{averageRevenue.toLocaleString('vi-VN')}</p>
            </div>
            <div className={styles.summaryCard}>
              <h3><FaChartLine /> Doanh thu cao nhất</h3>
              <p className={styles.amount}>{maxRevenue.toLocaleString('vi-VN')}</p>
            </div>
          </div>
          <div className={styles.chartContainer} style={{ height: '500px' }}>
            {revenueData.length > 0 ? (
              <Line options={options} data={chartData} />
            ) : (
              <p className={styles.noData}>Không có dữ liệu doanh thu cho khoảng thời gian đã chọn.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
} 
