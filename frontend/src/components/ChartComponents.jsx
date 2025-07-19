import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { format } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
      position: "bottom",
      labels: {
        padding: 20,
        font: {
          size: 12,
          family: "Inter",
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      borderRadius: 8,
      titleFont: {
        size: 14,
        family: "Inter",
      },
      bodyFont: {
        size: 13,
        family: "Inter",
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
          family: "Inter",
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        font: {
          size: 11,
          family: "Inter",
        },
      },
    },
  },
};

const ChartComponents = ({ analytics }) => {
  // Daily progress line chart data
  const dailyProgressData = useMemo(
    () => ({
      labels:
        analytics?.daily_chart?.map((d) =>
          format(new Date(d.date), "MMM dd")
        ) || [],
      datasets: [
        {
          label: "Study Hours",
          data: analytics?.daily_chart?.map((d) => d.hours) || [],
          fill: true,
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          borderColor: "rgb(14, 165, 233)",
          tension: 0.3,
          pointBackgroundColor: "rgb(14, 165, 233)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }),
    [analytics?.daily_chart]
  );

  // Topics distribution doughnut chart data
  const topicsData = useMemo(
    () => ({
      labels: analytics?.topics_distribution?.map((t) => t.topic) || [],
      datasets: [
        {
          data: analytics?.topics_distribution?.map((t) => t.hours) || [],
          backgroundColor: [
            "rgba(14, 165, 233, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(99, 102, 241, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(168, 85, 247, 0.8)",
          ],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }),
    [analytics?.topics_distribution]
  );

  // Weekly pattern bar chart data
  const weeklyPatternData = useMemo(
    () => ({
      labels: analytics?.weekly_pattern?.map((w) => w.day) || [],
      datasets: [
        {
          label: "Average Hours",
          data: analytics?.weekly_pattern?.map((w) => w.hours) || [],
          backgroundColor: "rgba(14, 165, 233, 0.7)",
          borderRadius: 8,
          hoverBackgroundColor: "rgba(14, 165, 233, 0.9)",
        },
      ],
    }),
    [analytics?.weekly_pattern]
  );

  const doughnutOptions = useMemo(
    () => ({
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                return data.labels.map((label, i) => {
                  const value = dataset.data[i];
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label}: ${value}h (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
      },
    }),
    []
  );

  return (
    <>
      {/* Daily Progress Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Daily Progress
        </h2>
        <div className="h-80">
          <Line data={dailyProgressData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topics Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Topics Distribution
          </h2>
          <div className="h-80">
            <Doughnut data={topicsData} options={doughnutOptions} />
          </div>
        </div>

        {/* Weekly Pattern */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Weekly Pattern
          </h2>
          <div className="h-80">
            <Bar
              data={weeklyPatternData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartComponents;
