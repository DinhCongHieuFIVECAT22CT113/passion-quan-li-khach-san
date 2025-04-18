'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9',
        drawBorder: false,
      },
      ticks: {
        stepSize: 200,
        color: '#64748b',
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
  },
};

export function LineChart({ data }: { data: { labels: string[]; data: number[] } }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Bookings',
        data: data.data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  return <Line options={chartOptions} data={chartData} />;
}

export function BarChart({ data }: { data: { labels: string[]; data: number[] } }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Revenue',
        data: data.data,
        backgroundColor: [
          '#ef4444',
          '#22c55e',
          '#4f46e5',
          '#f59e0b',
        ],
        borderRadius: 4,
        borderWidth: 0,
      },
    ],
  };

  return <Bar options={chartOptions} data={chartData} />;
} 