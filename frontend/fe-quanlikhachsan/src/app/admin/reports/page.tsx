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

  // Hàm lấy dữ liệu doanh thu (sẽ được thay thế bằng API call thực tế)
  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      // TODO: Thay thế bằng API call thực tế
      const mockData = generateMockData();
      setRevenueData(mockData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm tạo dữ liệu mẫu
  const generateMockData = (): RevenueData[] => {
    const data: RevenueData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (timeRange === 'day') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        data.push({
          date: d.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 10000000) + 5000000
        });
      }
    } else {
      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        data.push({
          date: d.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 100000000) + 150000000
        });
      }
    }
    
    return data;
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: revenueData.map(item => {
      const date = new Date(item.date);
      return timeRange === 'day' 
        ? `${date.getDate()}/${date.getMonth() + 1}`
        : `Tháng ${date.getMonth() + 1}`;
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
  const maxRevenue = Math.max(...revenueData.map(item => item.amount));

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