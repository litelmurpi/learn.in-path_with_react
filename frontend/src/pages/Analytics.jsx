import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
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
// eslint-disable-next-line no-unused-vars
import { format, subDays } from "date-fns";

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

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7"); // 7, 30, 90 days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics?days=${dateRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      </Layout>
    );
  }

  // Chart configurations
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

  // Daily progress line chart data
  const dailyProgressData = {
    labels:
      analytics?.daily_chart?.map((d) => format(new Date(d.date), "MMM dd")) ||
      [],
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
  };

  // Topics distribution doughnut chart data
  const topicsData = {
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
  };

  // Weekly pattern bar chart data
  const weeklyPatternData = {
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
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Date Range Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Track your learning progress and patterns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show data for:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.overview?.total_hours || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
                ⏱️
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Days</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.overview?.total_days || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Hours/Day</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.overview?.avg_hours_per_day?.toFixed(1) || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consistency</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.overview?.consistency_percentage || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                🔥
              </div>
            </div>
          </div>
        </div>

        {/* Daily Progress Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Daily Progress
          </h2>
          <div className="h-80">
            <Line data={dailyProgressData} options={chartOptions} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topics Distribution */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Topics Distribution
            </h2>
            <div className="h-80">
              <Doughnut
                data={topicsData}
                options={{
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
                            const total = dataset.data.reduce(
                              (a, b) => a + b,
                              0
                            );
                            return data.labels.map((label, i) => {
                              const value = dataset.data[i];
                              const percentage = (
                                (value / total) *
                                100
                              ).toFixed(1);
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
                }}
              />
            </div>
          </div>

          {/* Weekly Pattern */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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

        {/* Insights */}
        {analytics?.insights && analytics.insights.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="mr-2">💡</span> Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 bg-gray-50 rounded-xl"
                >
                  <span className="text-primary-600 mr-3 text-lg">•</span>
                  <p className="text-gray-700 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Study Times */}
        {analytics?.best_times && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="mr-2">⏰</span> Your Best Study Times
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">
                  Most Productive Day
                </p>
                <p className="text-lg font-semibold text-blue-900 mt-1">
                  {analytics.best_times.day || "No data"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <p className="text-sm text-purple-600 font-medium">
                  Peak Study Hour
                </p>
                <p className="text-lg font-semibold text-purple-900 mt-1">
                  {analytics.best_times.hour || "No data"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <p className="text-sm text-green-600 font-medium">
                  Average Session
                </p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {analytics.best_times.avg_session || "0"} mins
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
