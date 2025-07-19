import { format, formatDistanceToNow, parseISO } from "date-fns";

export const formatDate = (date, formatString = "MMM dd, yyyy") => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

export const formatMinutesToHours = (minutes) => {
  if (!minutes || minutes < 60) return `${minutes || 0}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatHours = (minutes) => {
  return (minutes / 60).toFixed(1);
};

export const formatRelativeTime = (date) => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error("Relative time formatting error:", error);
    return "";
  }
};
