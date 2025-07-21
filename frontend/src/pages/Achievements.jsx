import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import AchievementCard from "../components/AchievementCard";
import LevelProgress from "../components/LevelProgress";
import { useFetch } from "../hooks/useFetch";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Achievements = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data, loading, refetch } = useFetch("/achievements");
  const { data: dashboardData } = useFetch("/dashboard/stats");

  const categories = [
    { id: "all", name: "All", icon: "🏆" },
    { id: "milestone", name: "Milestones", icon: "🎯" },
    { id: "streak", name: "Streaks", icon: "🔥" },
    { id: "special", name: "Special", icon: "⭐" },
  ];

  const handleClaim = async (claimData) => {
    // Refresh data after claiming
    refetch();
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

  const achievements = data?.achievements || {};
  const stats = data?.stats || {};
  const gamification = dashboardData?.gamification || {};

  // Filter achievements by category
  const filteredAchievements =
    selectedCategory === "all"
      ? Object.values(achievements).flat()
      : achievements[selectedCategory] || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Level Progress */}
        {gamification.level && (
          <LevelProgress
            level={gamification.level}
            levelName={gamification.level_name}
            currentXP={gamification.current_xp}
            xpForNextLevel={gamification.xp_for_next_level}
            totalXP={gamification.total_xp}
          />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total || 0}
                </p>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unlocked
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.unlocked || 0}
                </p>
              </div>
              <span className="text-3xl">🔓</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unclaimed
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {gamification.unclaimed_achievements || 0}
                </p>
              </div>
              <span className="text-3xl">🎁</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AchievementCard
                achievement={achievement}
                onClaim={handleClaim}
              />
            </motion.div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No achievements in this category yet.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Achievements;
