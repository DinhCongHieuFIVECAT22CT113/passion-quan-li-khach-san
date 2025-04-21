'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
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

interface LineChartProps {
  data: {
    labels: string[];
    data: number[];
  };
}

export function LineChart({ data }: LineChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        data: data.data,
        borderColor: '#4318FF',
        backgroundColor: 'rgba(67, 24, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return <Line options={options} data={chartData} />;
} 