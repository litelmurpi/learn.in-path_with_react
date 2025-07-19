import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Heatmap from "../components/Heatmap";
import { format } from "date-fns";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, heatmapRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/heatmap"),
      ]);

      setStats(statsRes.data);
      setHeatmapData(heatmapRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: "Current Streak",
      value: `${stats?.current_streak || 0}`,
      unit: "days",
      subtitle: "Keep it up! 🔥",
      gradient: "from-orange-400 to-red-500",
      darkGradient: "dark:from-orange-600 dark:to-red-600",
      icon: "🔥",
    },
    {
      title: "Today's Study Time",
      value: `${stats?.today_hours || 0}`,
      unit: "hours",
      subtitle: "Great progress!",
      gradient: "from-blue-400 to-indigo-500",
      darkGradient: "dark:from-blue-600 dark:to-indigo-600",
      icon: "📖",
    },
    {
      title: "Total Study Time",
      value: `${stats?.total_hours || 0}`,
      unit: "hours",
      subtitle: "Lifetime achievement",
      gradient: "from-emerald-400 to-teal-500",
      darkGradient: "dark:from-emerald-600 dark:to-teal-600",
      icon: "🏆",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {stats?.user_name || "Learner"}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <Link to="/study-logs/new" className="btn-primary">
            <span className="mr-2">➕</span> New Study Session
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card group">
              <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
                {stat.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {stat.title}
                </h3>
                <div className="flex items-baseline space-x-2">
                  <p
                    className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} ${stat.darkGradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    {stat.unit}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Study Activity
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Track your consistency
            </span>
          </div>
          <Heatmap data={heatmapData} />
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
            <div className="space-y-3">
              {stats.recent_activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-2xl">
                      📚
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {activity.topic}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {format(
                            new Date(activity.study_date),
                            "MMM dd, yyyy"
                          )}
                        </span>
                        <span>•</span>
                        <span>{activity.duration_minutes} minutes</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/study-logs/${activity.id}/edit`}
                    className="opacity-0 group-hover:opacity-100 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-opacity"
                  >
                    Edit →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 dark:text-gray-400">
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
