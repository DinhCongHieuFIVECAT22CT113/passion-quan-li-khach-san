'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

interface BarChartProps {
  data: {
    labels: string[];
    data: number[];
  };
}

export function BarChart({ data }: BarChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: [
          '#ef4444',
          '#22c55e',
          '#4318FF',
          '#eab308',
        ],
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
} 