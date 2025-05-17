import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const PortfolioChart = ({ data }: { data: { labels: string[], values: number[] } }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Portfolio Value Over Time',
        data: data.values,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default PortfolioChart;
