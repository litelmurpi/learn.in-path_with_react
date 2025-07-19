// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { format } from "date-fns";

const StudyLogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    topic: "",
    duration_minutes: "",
    study_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const popularTopics = [
    { name: "Mathematics", emoji: "🔢" },
    { name: "Programming", emoji: "💻" },
    { name: "Physics", emoji: "⚡" },
    { name: "Chemistry", emoji: "🧪" },
    { name: "Biology", emoji: "🧬" },
    { name: "Language", emoji: "🗣️" },
  ];

  const quickDurations = [15, 30, 45, 60, 90, 120];

  useEffect(() => {
    if (isEdit) {
      fetchStudyLog();
    }
  }, [id, isEdit]);

  const fetchStudyLog = async () => {
    try {
      const response = await api.get(`/study-logs/${id}`);
      const log = response.data;
      setFormData({
        topic: log.topic,
        duration_minutes: log.duration_minutes,
        study_date: format(new Date(log.study_date), "yyyy-MM-dd"),
        notes: log.notes || "",
      });
    } catch (error) {
      console.error("Error fetching study log:", error);
      toast.error("Failed to fetch study log");
      navigate("/study-logs");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/study-logs/${id}`, formData);
        toast.success("Study log updated successfully");
      } else {
        await api.post("/study-logs", formData);
        toast.success("Study log created successfully");
      }
      navigate("/study-logs");
    } catch (error) {
      console.error("Error saving study log:", error);
      const message =
        error.response?.data?.message || "Failed to save study log";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Study Session" : "New Study Session"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit
              ? "Update your study session details"
              : "Record your learning progress"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Topic Field */}
          <div>
            <label htmlFor="topic" className="label">
              What did you study?
            </label>
            <input
              type="text"
              name="topic"
              id="topic"
              required
              className="input"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Linear Algebra, React Hooks"
            />

            {/* Quick Topic Selection */}
            {!isEdit && (
              <div className="mt-3 flex flex-wrap gap-2">
                {popularTopics.map((topic) => (
                  <button
                    key={topic.name}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, topic: topic.name })
                    }
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      formData.topic === topic.name
                        ? "bg-primary-100 border-primary-300 text-primary-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-1">{topic.emoji}</span>
                    {topic.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration Field */}
          <div>
            <label htmlFor="duration_minutes" className="label">
              How long did you study?
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                name="duration_minutes"
                id="duration_minutes"
                required
                min="1"
                max="1440"
                className="input flex-1"
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="60"
              />
              <span className="text-gray-500">minutes</span>
            </div>

            {/* Quick Duration Selection */}
            <div className="mt-3 flex flex-wrap gap-2">
              {quickDurations.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, duration_minutes: duration })
                  }
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    parseInt(formData.duration_minutes) === duration
                      ? "bg-primary-100 border-primary-300 text-primary-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {duration < 60 ? `${duration}m` : `${duration / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label htmlFor="study_date" className="label">
              When did you study?
            </label>
            <input
              type="date"
              name="study_date"
              id="study_date"
              required
              max={format(new Date(), "yyyy-MM-dd")}
              className="input"
              value={formData.study_date}
              onChange={handleChange}
            />
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="label">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              id="notes"
              rows="4"
              className="input resize-none"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Key concepts learned, difficulties faced, or any reflections..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Add any thoughts or key takeaways from your study session
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/study-logs")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span>{isEdit ? "Update Session" : "Save Session"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StudyLogForm;
