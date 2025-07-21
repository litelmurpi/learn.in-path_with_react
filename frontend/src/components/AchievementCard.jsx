import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AchievementCard = ({ achievement, onClaim }) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (claiming || achievement.is_claimed) return;

    setClaiming(true);
    try {
      const response = await api.post(`/achievements/${achievement.id}/claim`);
      toast.success(`Claimed ${achievement.xp_reward} XP! 🎉`);
      onClaim(response.data);
    } catch (error) {
      toast.error("Failed to claim achievement");
    } finally {
      setClaiming(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-gray-400";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        achievement.is_unlocked
          ? achievement.is_claimed
            ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700"
            : "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-lg"
          : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Unlocked but not claimed indicator */}
      {achievement.is_unlocked && !achievement.is_claimed && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <span className="text-white text-xs font-bold">!</span>
        </motion.div>
      )}

      <div className="flex items-start space-x-4">
        <div
          className={`text-4xl ${
            !achievement.is_unlocked && "opacity-30 grayscale"
          }`}
        >
          {achievement.icon}
        </div>

        <div className="flex-1">
          <h3
            className={`font-semibold text-gray-900 dark:text-white ${
              !achievement.is_unlocked && "opacity-50"
            }`}
          >
            {achievement.name}
          </h3>
          <p
            className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${
              !achievement.is_unlocked && "opacity-50"
            }`}
          >
            {achievement.description}
          </p>

          {/* Progress Bar */}
          {!achievement.is_unlocked && achievement.progress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>
                  {achievement.progress.current} / {achievement.progress.target}
                </span>
                <span>{achievement.progress.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${getProgressColor(
                    achievement.progress.percentage
                  )} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${achievement.progress.percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* XP Reward */}
          <div className="flex items-center justify-between mt-3">
            <span
              className={`text-sm font-medium ${
                achievement.is_unlocked
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              +{achievement.xp_reward} XP
            </span>

            {/* Claim Button */}
            {achievement.is_unlocked && !achievement.is_claimed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                disabled={claiming}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {claiming ? "Claiming..." : "Claim"}
              </motion.button>
            )}

            {achievement.is_claimed && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Claimed
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;
