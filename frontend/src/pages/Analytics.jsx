/* eslint-disable no-unused-vars */
import { useState, useMemo, lazy, Suspense } from "react";
import Layout from "../components/Layout";
import { useFetch } from "../hooks/useFetch";
import { formatDate } from "../utils/formatters";

// Lazy load chart components
const ChartComponents = lazy(() => import("../components/ChartComponents"));

// Loading skeleton for charts
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
);

// Stat card component
const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
      <div
        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const Analytics = () => {
  const [dateRange, setDateRange] = useState("7");
  const {
    data: analytics,
    loading,
    refetch,
    isFromCache,
  } = useFetch(`/analytics?days=${dateRange}`, {
    cacheTTL: 10 * 60 * 1000, // 10 minutes cache
  });

  const statsData = useMemo(
    () => [
      {
        title: "Total Hours",
        value: analytics?.overview?.total_hours || 0,
        icon: "⏱️",
        color: "bg-primary-100 dark:bg-primary-900/30",
      },
      {
        title: "Study Days",
        value: analytics?.overview?.total_days || 0,
        icon: "📅",
        color: "bg-green-100 dark:bg-green-900/30",
      },
      {
        title: "Avg Hours/Day",
        value: (analytics?.overview?.avg_hours_per_day || 0).toFixed(1),
        icon: "📊",
        color: "bg-purple-100 dark:bg-purple-900/30",
      },
      {
        title: "Consistency",
        value: `${analytics?.overview?.consistency_percentage || 0}%`,
        icon: "🔥",
        color: "bg-orange-100 dark:bg-orange-900/30",
      },
    ],
    [analytics]
  );

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  if (loading && !analytics) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Date Range Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your learning progress and patterns
              {isFromCache && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (Cached data)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show data for:
            </span>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Section - Lazy Loaded */}
        {analytics && (
          <Suspense fallback={<ChartSkeleton />}>
            <ChartComponents analytics={analytics} />
          </Suspense>
        )}

        {/* Insights */}
        {analytics?.insights && analytics.insights.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              <span className="mr-2">💡</span> Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <span className="text-primary-600 dark:text-primary-400 mr-3 text-lg">
                    •
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Study Times */}
        {analytics?.best_times && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              <span className="mr-2">⏰</span> Your Best Study Times
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Most Productive Day
                </p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-200 mt-1">
                  {analytics.best_times.day || "No data"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Peak Study Hour
                </p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-200 mt-1">
                  {analytics.best_times.hour || "No data"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Average Session
                </p>
                <p className="text-lg font-semibold text-green-900 dark:text-green-200 mt-1">
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
