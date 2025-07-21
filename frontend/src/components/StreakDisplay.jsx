import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

const StreakDisplay = ({
  currentStreak,
  longestStreak,
  freezeAvailable,
  onFreeze,
}) => {
  const [freezing, setFreezing] = useState(false);

  const handleFreeze = async () => {
    if (freezing || freezeAvailable === 0) return;

    setFreezing(true);
    try {
      await onFreeze();
      toast.success(
        "Streak freeze activated! Your streak is protected today 🛡️"
      );
    } catch (error) {
      toast.error("Failed to activate streak freeze");
    } finally {
      setFreezing(false);
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 100) return "🔥💯";
    if (streak >= 50) return "🔥🌟";
    if (streak >= 30) return "🔥⭐";
    if (streak >= 7) return "🔥";
    if (streak >= 3) return "✨";
    return "🌱";
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getStreakEmoji(currentStreak)}
            </motion.span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentStreak} Days
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Streak
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Best Streak
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {longestStreak} days
              </p>
            </div>

            {freezeAvailable > 0 && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Freeze Available
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {[...Array(freezeAvailable)].map((_, i) => (
                    <span key={i} className="text-lg">
                      🛡️
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {freezeAvailable > 0 && currentStreak > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFreeze}
            disabled={freezing}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {freezing ? "Activating..." : "Use Freeze"}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;
