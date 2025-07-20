/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getDay,
  getWeek,
  getMonth,
  startOfWeek,
  addDays,
  differenceInDays,
  parseISO,
  subMonths,
  isToday,
  isSameDay,
} from "date-fns";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getColor = (level, isDark) => {
  const colors = isDark
    ? [
        "bg-gray-800",
        "bg-emerald-900/50",
        "bg-emerald-800/70",
        "bg-emerald-700",
        "bg-emerald-600",
        "bg-emerald-500",
      ]
    : [
        "bg-gray-100",
        "bg-emerald-100",
        "bg-emerald-200",
        "bg-emerald-300",
        "bg-emerald-400",
        "bg-emerald-500",
      ];
  return colors[level] || colors[0];
};

// Format number helper
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

// Tooltip Component
const Tooltip = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeatmapCell = memo(({ day, isDark, onClick, isSelected }) => {
  if (!day) return <div className="w-[11px] h-[11px]" />;

  const isCurrentDay = isToday(day.date);
  const hasActivity = day.count > 0;

  return (
    <Tooltip
      content={
        <div>
          <div className="font-semibold">{format(day.date, "MMM d, yyyy")}</div>
          <div className="text-xs">
            {hasActivity ? (
              <>
                <div>📚 {(day.count / 60).toFixed(1)} hours studied</div>
                {day.sessions && (
                  <div>
                    📝 {day.sessions} session{day.sessions > 1 ? "s" : ""}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400">No activity</div>
            )}
          </div>
        </div>
      }
    >
      <div
        onClick={() => onClick && onClick(day)}
        className={`
          w-[11px] h-[11px] rounded-sm transition-all duration-200
          ${getColor(day.level, isDark)}
          ${
            hasActivity
              ? "cursor-pointer hover:ring-2 hover:ring-primary-400 dark:hover:ring-primary-500"
              : ""
          }
          ${isCurrentDay ? "ring-2 ring-yellow-400 dark:ring-yellow-500" : ""}
          ${isSelected ? "ring-2 ring-primary-500 scale-125" : ""}
        `}
      />
    </Tooltip>
  );
});

HeatmapCell.displayName = "HeatmapCell";

// Stats Card Component with Icons
const StatsCard = ({ icon, label, value, color = "primary" }) => {
  const colorClasses = {
    primary: "from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700",
    success:
      "from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700",
    warning:
      "from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700",
    danger: "from-red-400 to-red-600 dark:from-red-500 dark:to-red-700",
    purple:
      "from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700",
  };

  const bgClasses = {
    primary: "bg-blue-50 dark:bg-blue-900/20",
    success: "bg-emerald-50 dark:bg-emerald-900/20",
    warning: "bg-amber-50 dark:bg-amber-900/20",
    danger: "bg-red-50 dark:bg-red-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20",
  };

  return (
    <div
      className={`${bgClasses[color]} rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}
        >
          <span className="text-xl sm:text-2xl">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const Heatmap = ({ data = [], onDateSelect }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState("year");
  const [selectedDay, setSelectedDay] = useState(null);
  const [timeRange, setTimeRange] = useState("12");

  const isDark = useMemo(
    () => document.documentElement.classList.contains("dark"),
    []
  );

  const calendarData = useMemo(() => {
    const today = new Date();
    let startDate, endDate;

    if (viewMode === "year") {
      const months = parseInt(timeRange);
      endDate = today;
      startDate = subMonths(today, months - 1);
      startDate.setDate(1);
    } else {
      startDate = new Date(today.getFullYear(), selectedMonth, 1);
      endDate = new Date(today.getFullYear(), selectedMonth + 1, 0);
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dataMap = new Map(data.map((item) => [item.date, item]));

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayData = dataMap.get(dateStr);

      return {
        date: day,
        dateStr,
        count: dayData?.count || 0,
        level: dayData?.level || 0,
        sessions: dayData?.sessions || 0,
        day: getDay(day),
        week: getWeek(day),
        month: getMonth(day),
      };
    });
  }, [data, viewMode, selectedMonth, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeDays = calendarData.filter((d) => d.count > 0);
    const totalMinutes = activeDays.reduce((sum, d) => sum + d.count, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const avgHoursPerActiveDay =
      activeDays.length > 0
        ? (totalMinutes / activeDays.length / 60).toFixed(1)
        : "0";

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = format(addDays(today, -i), "yyyy-MM-dd");
      const hasActivity = data.some((d) => d.date === checkDate && d.count > 0);
      if (hasActivity) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Find longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedData = [...calendarData].sort((a, b) => a.date - b.date);

    sortedData.forEach((day, index) => {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return {
      totalDays: activeDays.length,
      totalHours: formatNumber(parseFloat(totalHours)),
      avgHoursPerActiveDay,
      currentStreak,
      longestStreak,
    };
  }, [calendarData, data]);

  const yearGrid = useMemo(() => {
    if (viewMode !== "year" || !calendarData.length) return [];

    const grid = Array(7)
      .fill(null)
      .map(() => []);
    const firstDay = calendarData[0];
    const startPadding = firstDay.day;

    for (let i = 0; i < startPadding; i++) {
      grid[i].push(null);
    }

    calendarData.forEach((day) => {
      grid[day.day].push(day);
    });

    return grid;
  }, [calendarData, viewMode]);

  const monthPositions = useMemo(() => {
    if (viewMode !== "year") return {};

    const positions = {};
    let lastMonth = -1;
    calendarData.forEach((day, index) => {
      const month = day.month;
      if (month !== lastMonth) {
        positions[month] = Math.floor(index / 7);
        lastMonth = month;
      }
    });
    return positions;
  }, [calendarData, viewMode]);

  const weeks = useMemo(() => {
    if (viewMode !== "month") return null;

    const weeksObj = {};
    calendarData.forEach((day) => {
      const weekNum = day.week;
      if (!weeksObj[weekNum]) {
        weeksObj[weekNum] = Array(7).fill(null);
      }
      weeksObj[weekNum][day.day] = day;
    });
    return Object.values(weeksObj);
  }, [calendarData, viewMode]);

  const handleDayClick = useCallback(
    (day) => {
      if (day.count > 0) {
        setSelectedDay(day);
        if (onDateSelect) {
          onDateSelect(day);
        }
      }
    },
    [onDateSelect]
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <StatsCard
          icon="📅"
          label="Total Days"
          value={stats.totalDays}
          color="primary"
        />
        <StatsCard
          icon="⏱️"
          label="Total Hours"
          value={stats.totalHours}
          color="success"
        />
        <StatsCard
          icon="📊"
          label="Avg/Day"
          value={`${stats.avgHoursPerActiveDay}h`}
          color="warning"
        />
        <StatsCard
          icon="🔥"
          label="Current"
          value={`${stats.currentStreak}d`}
          color="danger"
        />
        <StatsCard
          icon="🏆"
          label="Best"
          value={`${stats.longestStreak}d`}
          color="purple"
        />
      </div>

      {/* Controls - Responsive Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
          >
            <option value="year">Year View</option>
            <option value="month">Month View</option>
          </select>

          {viewMode === "year" && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          )}

          {viewMode === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>

      {viewMode === "year" ? (
        // Year view - GitHub-style heatmap with horizontal scroll on mobile
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full sm:min-w-0">
              {/* Month labels */}
              <div className="relative h-6 mb-2 ml-6 sm:ml-10">
                {Object.entries(monthPositions).map(([month, position]) => (
                  <div
                    key={month}
                    className="absolute text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400"
                    style={{ left: `${position * 14}px` }}
                  >
                    {MONTHS[parseInt(month)].substring(0, 3)}
                  </div>
                ))}
              </div>

              <div className="flex">
                {/* Day labels */}
                <div className="flex flex-col mr-1 sm:mr-3">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <div
                      key={index}
                      className="h-[14px] text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center"
                    >
                      {index % 2 === 1 ? day.substring(0, 1) : ""}
                    </div>
                  ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex flex-col">
                  <div className="flex gap-[3px]">
                    {yearGrid[0]?.map((_, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[3px]">
                        {yearGrid.map((dayRow, dayIndex) => (
                          <HeatmapCell
                            key={`${weekIndex}-${dayIndex}`}
                            day={dayRow[weekIndex]}
                            isDark={isDark}
                            onClick={handleDayClick}
                            isSelected={
                              selectedDay &&
                              dayRow[weekIndex] &&
                              isSameDay(
                                selectedDay.date,
                                dayRow[weekIndex].date
                              )
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    Less
                  </span>
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <Tooltip
                      key={level}
                      content={
                        level === 0
                          ? "No activity"
                          : level === 1
                          ? "< 1 hour"
                          : level === 2
                          ? "1-2 hours"
                          : level === 3
                          ? "2-4 hours"
                          : level === 4
                          ? "4-6 hours"
                          : "6+ hours"
                      }
                    >
                      <div
                        className={`w-[11px] h-[11px] rounded-sm ${getColor(
                          level,
                          isDark
                        )} cursor-help`}
                      />
                    </Tooltip>
                  ))}
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    More
                  </span>
                </div>

                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  {calendarData.length} days tracked
                </div>
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDay && selectedDay.count > 0 && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2">
                {format(selectedDay.date, "EEEE, MMMM d, yyyy")}
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Study Time:
                  </span>
                  <span className="ml-1 sm:ml-2 font-medium text-gray-900 dark:text-white">
                    {(selectedDay.count / 60).toFixed(1)} hours
                  </span>
                </div>
                {selectedDay.sessions > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Sessions:
                    </span>
                    <span className="ml-1 sm:ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedDay.sessions}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Month view remains the same but with improved stats
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {MONTHS[selectedMonth]} {new Date().getFullYear()}
          </h3>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-400 py-1 sm:py-2"
              >
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {weeks?.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => day && handleDayClick(day)}
                  className={`
                    aspect-square p-1 sm:p-2 rounded-lg border transition-all
                    ${
                      day
                        ? day.count > 0
                          ? "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer"
                          : "border-gray-100 dark:border-gray-800"
                        : "border-transparent"
                    }
                    ${
                      day && isToday(day.date)
                        ? "ring-2 ring-yellow-400 dark:ring-yellow-500"
                        : ""
                    }
                  `}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <div
                        className={`text-[10px] sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                          isToday(day.date)
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {format(day.date, "d")}
                      </div>
                      <div
                        className={`flex-1 rounded-md ${getColor(
                          day.level,
                          isDark
                        )} ${
                          day.count > 0
                            ? "ring-1 ring-inset ring-gray-200 dark:ring-gray-600"
                            : ""
                        } flex items-center justify-center`}
                      >
                        {day.count > 0 && (
                          <div className="text-[8px] sm:text-xs text-center font-medium text-gray-700 dark:text-gray-300">
                            {(day.count / 60).toFixed(1)}h
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Summary - Responsive Grid */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block sm:inline">
                  Total Days:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white block sm:inline sm:ml-2">
                  {calendarData.filter((d) => d.count > 0).length}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block sm:inline">
                  Total Hours:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white block sm:inline sm:ml-2">
                  {(
                    calendarData.reduce((sum, d) => sum + d.count, 0) / 60
                  ).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block sm:inline">
                  Avg/Day:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white block sm:inline sm:ml-2">
                  {(
                    calendarData.reduce((sum, d) => sum + d.count, 0) /
                      60 /
                      calendarData.filter((d) => d.count > 0).length || 0
                  ).toFixed(1)}
                  h
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block sm:inline">
                  Completion:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white block sm:inline sm:ml-2">
                  {Math.round(
                    (calendarData.filter((d) => d.count > 0).length /
                      calendarData.length) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Heatmap);
