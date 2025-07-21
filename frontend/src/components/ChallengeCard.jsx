import { motion } from "framer-motion";

const ChallengeCard = ({ challenge }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "from-green-400 to-green-600";
    if (percentage >= 75) return "from-yellow-400 to-yellow-600";
    if (percentage >= 50) return "from-orange-400 to-orange-600";
    return "from-gray-400 to-gray-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-xl ${
        challenge.is_completed
          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      } shadow-sm hover:shadow-md transition-all duration-300`}
    >
      {/* Completed Badge */}
      {challenge.is_completed && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-sm">✓</span>
        </motion.div>
      )}

      <div className="flex items-start space-x-3">
        <div className="text-3xl">{challenge.icon}</div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {challenge.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {challenge.description}
          </p>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {challenge.current_progress} / {challenge.requirement_value}
              </span>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                +{challenge.xp_reward} XP
              </span>
            </div>

            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getProgressColor(
                  challenge.progress_percentage
                )} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${challenge.progress_percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;
