/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { formatDate } from "../utils/formatters";
import { POPULAR_TOPICS, QUICK_DURATIONS } from "../utils/constants";
import { useDebounce } from "../hooks/useDebounce";

// Memoized quick select button
const QuickSelectButton = memo(({ label, value, currentValue, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
      currentValue === value
        ? "bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300"
        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    {label}
  </button>
));

QuickSelectButton.displayName = "QuickSelectButton";

const StudyLogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    topic: "",
    duration_minutes: "",
    study_date: formatDate(new Date(), "yyyy-MM-dd"),
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Debounce notes for auto-save draft
  const debouncedNotes = useDebounce(formData.notes, 1000);

  // Load existing data if editing
  useEffect(() => {
    if (isEdit) {
      fetchStudyLog();
    } else {
      // Load draft from localStorage
      const draft = localStorage.getItem("studyLogDraft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setFormData((prev) => ({ ...prev, ...parsedDraft }));
          toast.success("Draft loaded");
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, [id, isEdit]);

  // Auto-save draft
  useEffect(() => {
    if (!isEdit && formData.topic) {
      localStorage.setItem("studyLogDraft", JSON.stringify(formData));
    }
  }, [formData, isEdit]);

  // Clear draft on successful save
  const clearDraft = useCallback(() => {
    localStorage.removeItem("studyLogDraft");
  }, []);

  const fetchStudyLog = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/study-logs/${id}`);
      const log = response.data;
      setFormData({
        topic: log.topic,
        duration_minutes: log.duration_minutes.toString(),
        study_date: formatDate(new Date(log.study_date), "yyyy-MM-dd"),
        notes: log.notes || "",
      });
    } catch (error) {
      console.error("Error fetching study log:", error);
      toast.error("Failed to fetch study log");
      navigate("/study-logs");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required";
    }

    const duration = parseInt(formData.duration_minutes);
    if (!duration || duration < 1) {
      newErrors.duration_minutes = "Duration must be at least 1 minute";
    } else if (duration > 1440) {
      newErrors.duration_minutes = "Duration cannot exceed 24 hours";
    }

    if (!formData.study_date) {
      newErrors.study_date = "Date is required";
    } else if (new Date(formData.study_date) > new Date()) {
      newErrors.study_date = "Date cannot be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes),
      };

      if (isEdit) {
        await api.put(`/study-logs/${id}`, payload);
        toast.success("Study log updated successfully");
      } else {
        await api.post("/study-logs", payload);
        toast.success("Study log created successfully");
        clearDraft();
      }
      navigate("/study-logs");
    } catch (error) {
      console.error("Error saving study log:", error);
      const message =
        error.response?.data?.message || "Failed to save study log";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const setTopic = useCallback((topic) => {
    setFormData((prev) => ({ ...prev, topic }));
  }, []);

  const setDuration = useCallback((duration) => {
    setFormData((prev) => ({ ...prev, duration_minutes: duration.toString() }));
  }, []);

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
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Study Session" : "New Study Session"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
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
              className={`input ${errors.topic ? "border-red-500" : ""}`}
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Linear Algebra, React Hooks"
            />
            {errors.topic && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.topic}
              </p>
            )}

            {/* Quick Topic Selection */}
            {!isEdit && (
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((topic) => (
                  <QuickSelectButton
                    key={topic.name}
                    label={`${topic.emoji} ${topic.name}`}
                    value={topic.name}
                    currentValue={formData.topic}
                    onClick={setTopic}
                  />
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
                className={`input flex-1 ${
                  errors.duration_minutes ? "border-red-500" : ""
                }`}
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="60"
              />
              <span className="text-gray-500 dark:text-gray-400">minutes</span>
            </div>
            {errors.duration_minutes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.duration_minutes}
              </p>
            )}

            {/* Quick Duration Selection */}
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_DURATIONS.map((duration) => (
                <QuickSelectButton
                  key={duration}
                  label={duration < 60 ? `${duration}m` : `${duration / 60}h`}
                  value={duration}
                  currentValue={parseInt(formData.duration_minutes) || 0}
                  onClick={setDuration}
                />
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
              max={formatDate(new Date(), "yyyy-MM-dd")}
              className={`input ${errors.study_date ? "border-red-500" : ""}`}
              value={formData.study_date}
              onChange={handleChange}
            />
            {errors.study_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.study_date}
              </p>
            )}
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
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add any thoughts or key takeaways from your study session
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {!isEdit && formData.topic && (
                <span>Draft saved automatically</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate("/study-logs")}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <span>{isEdit ? "Update Session" : "Save Session"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StudyLogForm;
