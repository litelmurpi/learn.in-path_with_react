import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { format } from "date-fns";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const StudyLogs = () => {
  const [studyLogs, setStudyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStudyLogs();
  }, [currentPage]);

  const fetchStudyLogs = async () => {
    try {
      const response = await api.get(`/study-logs?page=${currentPage}`);
      setStudyLogs(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Error fetching study logs:", error);
      toast.error("Failed to fetch study logs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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
        fetchStudyLogs();
      } catch (error) {
        console.error("Error deleting study log:", error);
        toast.error("Failed to delete study log");
      }
    }
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

  const topicEmojis = {
    mathematics: "🔢",
    programming: "💻",
    physics: "⚡",
    chemistry: "🧪",
    biology: "🧬",
    language: "🗣️",
    default: "📚",
  };

  const getTopicEmoji = (topic) => {
    const lowerTopic = topic.toLowerCase();
    return Object.keys(topicEmojis).find((key) => lowerTopic.includes(key))
      ? topicEmojis[
          Object.keys(topicEmojis).find((key) => lowerTopic.includes(key))
        ]
      : topicEmojis.default;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Logs</h1>
            <p className="text-gray-600 mt-1">Track your learning journey</p>
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
                <div key={log.id} className="card card-hover group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-2xl">
                        {getTopicEmoji(log.topic)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {log.topic}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            📅{" "}
                            {format(new Date(log.study_date), "MMM dd, yyyy")}
                          </span>
                          <span className="flex items-center">
                            ⏱️ {log.duration_minutes} minutes
                          </span>
                        </div>
                        {log.notes && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/study-logs/${log.id}/edit`}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
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
                        onClick={() => handleDelete(log.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === index + 1
                            ? "bg-primary-600 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No study logs yet
            </h3>
            <p className="text-gray-600 mb-6">
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
