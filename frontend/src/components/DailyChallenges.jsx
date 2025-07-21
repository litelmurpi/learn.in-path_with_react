import { Link } from "react-router-dom";
import ChallengeCard from "./ChallengeCard";
import { useFetch } from "../hooks/useFetch";

const DailyChallenges = () => {
  const { data: challenges, loading } = useFetch("/challenges");

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const dailyChallenges = challenges?.daily || [];
  const completedCount = dailyChallenges.filter((c) => c.is_completed).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Daily Challenges
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/{dailyChallenges.length} Complete
        </span>
      </div>

      <div className="space-y-3">
        {dailyChallenges.slice(0, 3).map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      {dailyChallenges.length > 3 && (
        <Link
          to="/challenges"
          className="block text-center mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
        >
          View all challenges →
        </Link>
      )}
    </div>
  );
};

export default DailyChallenges;
