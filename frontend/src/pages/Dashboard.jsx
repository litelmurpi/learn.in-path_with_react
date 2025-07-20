import { memo, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Heatmap from "../components/Heatmap";
import { formatDate, formatMinutesToHours } from "../utils/formatters";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../contexts/AuthContext";

// Format large numbers
const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toFixed(1);
};

// Memoized stat card component
const StatCard = memo(({ stat }) => (
  <div className="stat-card group transform transition-transform duration-300 hover:scale-105">
    <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
      {stat.icon}
    </div>
    <div className="relative z-10">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {stat.title}
      </h3>
      <div className="flex items-baseline space-x-2">
        <p
          className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.gradient} ${stat.darkGradient} bg-clip-text text-transparent`}
        >
          {stat.value}
        </p>
        <span className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
          {stat.unit}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
        {stat.subtitle}
      </p>
      {stat.progress !== undefined && (
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${stat.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stat.progressText}
          </p>
        </div>
      )}
    </div>
  </div>
));

StatCard.displayName = "StatCard";

// Memoized activity item component
const ActivityItem = memo(({ activity }) => (
  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group">
    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
          📚
        </div>
        {activity.duration_minutes >= 120 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
            ⭐
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
          {activity.topic}
        </h4>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(activity.study_date)}</span>
          <span>•</span>
          <span>{formatMinutesToHours(activity.duration_minutes)}</span>
          {activity.notes && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                Has notes
              </span>
            </>
          )}
        </div>
      </div>
    </div>
    <Link
      to={`/study-logs/${activity.id}/edit`}
      className="opacity-0 group-hover:opacity-100 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-all ml-2 flex-shrink-0"
    >
      <span className="hidden sm:inline">Edit →</span>
      <span className="sm:hidden">→</span>
    </Link>
  </div>
));

ActivityItem.displayName = "ActivityItem";

// Daily Goal Progress Component
const DailyGoalProgress = ({ todayHours, goalHours = 2 }) => {
  const progress = Math.min((todayHours / goalHours) * 100, 100);
  const isCompleted = progress >= 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          Daily Goal
        </h3>
        <span
          className={`text-xs sm:text-sm font-semibold ${
            isCompleted
              ? "text-green-600 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {todayHours.toFixed(1)}h / {goalHours}h
        </span>
      </div>
      <div className="relative">
        <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isCompleted
                ? "bg-gradient-to-r from-green-400 to-green-500"
                : "bg-gradient-to-r from-primary-400 to-primary-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-white">
              🎉 Goal!
            </span>
          </div>
        )}
      </div>
      {!isCompleted && (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
          {(goalHours - todayHours).toFixed(1)}h more to reach goal
        </p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const user = useAuth().user;
  const { data: stats, loading: statsLoading } = useFetch("/dashboard/stats");
  const { data: heatmapData, loading: heatmapLoading } =
    useFetch("/dashboard/heatmap");
  const [selectedDate, setSelectedDate] = useState(null);

  const loading = statsLoading || heatmapLoading;

  const handleDateSelect = useCallback((day) => {
    setSelectedDate(day);
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "Current Streak",
        value: `${stats?.current_streak || 0}`,
        unit: "days",
        subtitle: stats?.current_streak > 0 ? "Keep it up! 🔥" : "Start today!",
        gradient: "from-orange-400 to-red-500",
        darkGradient: "dark:from-orange-600 dark:to-red-600",
        icon: "🔥",
        progress:
          stats?.current_streak > 0
            ? Math.min((stats.current_streak / 30) * 100, 100)
            : 0,
        progressText:
          stats?.current_streak >= 30
            ? "30+ day streak!"
            : `${30 - (stats?.current_streak || 0)} days to 30-day streak`,
      },
      {
        title: "Today's Study Time",
        value: formatLargeNumber(stats?.today_hours || 0),
        unit: "hours",
        subtitle: "Great progress!",
        gradient: "from-blue-400 to-indigo-500",
        darkGradient: "dark:from-blue-600 dark:to-indigo-600",
        icon: "📖",
      },
      {
        title: "Total Study Time",
        value: formatLargeNumber(stats?.total_hours || 0),
        unit: "hours",
        subtitle: "Lifetime achievement",
        gradient: "from-emerald-400 to-teal-500",
        darkGradient: "dark:from-emerald-600 dark:to-teal-600",
        icon: "🏆",
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.name || "Learner"}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {formatDate(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <DailyGoalProgress
              todayHours={parseFloat(stats?.today_hours || 0)}
            />
            <Link
              to="/study-logs/new"
              className="btn-primary text-center whitespace-nowrap"
            >
              <span className="mr-2">➕</span> New Session
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {statCards.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Enhanced Heatmap */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Your Learning Journey
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Visualize your consistency and progress
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              View analytics →
            </Link>
          </div>
          <Heatmap data={heatmapData || []} onDateSelect={handleDateSelect} />
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Recent Study Sessions
            </h2>
            <Link
              to="/study-logs"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              View all →
            </Link>
          </div>

          {stats?.recent_activities?.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {stats.recent_activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="text-5xl sm:text-6xl mb-4">📚</div>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                No study sessions yet. Start learning to track your progress!
              </p>
              <Link
                to="/study-logs/new"
                className="btn-primary mt-4 inline-block"
              >
                Start First Session
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
