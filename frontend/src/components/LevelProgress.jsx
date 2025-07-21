import { motion } from "framer-motion";
import { useMemo } from "react";

const LevelProgress = ({
  level,
  levelName,
  currentXP,
  xpForNextLevel,
  totalXP,
}) => {
  const progressPercentage = useMemo(() => {
    return Math.min(100, Math.round((currentXP / xpForNextLevel) * 100));
  }, [currentXP, xpForNextLevel]);

  const getLevelColor = (level) => {
    if (level >= 50) return "from-purple-400 to-purple-600";
    if (level >= 30) return "from-red-400 to-red-600";
    if (level >= 20) return "from-orange-400 to-orange-600";
    if (level >= 10) return "from-blue-400 to-blue-600";
    if (level >= 5) return "from-green-400 to-green-600";
    return "from-gray-400 to-gray-600";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getLevelColor(
              level
            )} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
          >
            {level}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Level {level} - {levelName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {totalXP.toLocaleString()} Total XP
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentXP} / {xpForNextLevel} XP
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {progressPercentage}% Complete
          </p>
        </div>
      </div>

      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${getLevelColor(
            level
          )} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default LevelProgress;
