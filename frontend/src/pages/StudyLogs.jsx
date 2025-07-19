import { useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { formatDate, formatMinutesToHours } from "../utils/formatters";
import { getTopicEmoji } from "../utils/constants";
import { useFetch } from "../hooks/useFetch";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const StudyLogItem = memo(({ log, onDelete }) => (
  <div className="card card-hover group">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-2xl">
          {getTopicEmoji(log.topic)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {log.topic}
          </h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              📅 {formatDate(log.study_date)}
            </span>
            <span className="flex items-center">
              ⏱️ {formatMinutesToHours(log.duration_minutes)}
            </span>
          </div>
          {log.notes && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {log.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/study-logs/${log.id}/edit`}
          className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          title="Edit"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Link>
        <button
          onClick={() => onDelete(log.id)}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
));

StudyLogItem.displayName = "StudyLogItem";

const StudyLogs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: response,
    loading,
    refetch,
  } = useFetch(`/study-logs?page=${currentPage}`);

  const studyLogs = response?.data || [];
  const totalPages = response?.last_page || 1;

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0ea5e9",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        customClass: {
          container: "font-sans",
          popup: "rounded-2xl",
          confirmButton: "rounded-lg px-6 py-2.5",
          cancelButton: "rounded-lg px-6 py-2.5",
        },
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/study-logs/${id}`);
          toast.success("Study log deleted successfully");
          refetch();
        } catch (error) {
          console.error("Error deleting study log:", error);
          toast.error("Failed to delete study log");
        }
      }
    },
    [refetch]
  );

  const PageButton = ({ page, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
        isActive
          ? "bg-primary-600 text-white"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      {page}
    </button>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Study Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your learning journey
            </p>
          </div>
          <Link to="/study-logs/new" className="btn-primary">
            <span className="mr-2">➕</span> New Session
          </Link>
        </div>

        {/* Study Logs Grid/List */}
        {studyLogs.length > 0 ? (
          <>
            <div className="grid gap-4">
              {studyLogs.map((log) => (
                <StudyLogItem key={log.id} log={log} onDelete={handleDelete} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }

                      return (
                        <PageButton
                          key={pageNum}
                          page={pageNum}
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                        />
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No study logs yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your learning progress today!
            </p>
            <Link to="/study-logs/new" className="btn-primary inline-block">
              Create Your First Log
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudyLogs;
