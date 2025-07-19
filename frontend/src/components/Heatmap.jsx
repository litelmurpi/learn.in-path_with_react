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
        "bg-green-900/50",
        "bg-green-800/70",
        "bg-green-700",
        "bg-green-600",
      ]
    : [
        "bg-gray-100",
        "bg-green-200",
        "bg-green-300",
        "bg-green-400",
        "bg-green-500",
      ];
  return colors[level] || colors[0];
};

const HeatmapCell = memo(({ day, isDark }) => {
  if (!day) return <div className="w-[10px] h-[10px]" />;

  return (
    <div
      className={`w-[10px] h-[10px] rounded-sm ${getColor(day.level, isDark)} ${
        day.count > 0
          ? "hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 cursor-pointer"
          : ""
      } transition-all`}
      title={`${day.dateStr}: ${Math.round(day.count / 60)} hours`}
    />
  );
});

HeatmapCell.displayName = "HeatmapCell";

const Heatmap = ({ data = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState("year");

  const isDark = useMemo(
    () => document.documentElement.classList.contains("dark"),
    []
  );

  const calendarData = useMemo(() => {
    const today = new Date();
    let startDate, endDate;

    if (viewMode === "year") {
      endDate = today;
      startDate = addDays(today, -364);
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
        day: getDay(day),
        week: getWeek(day),
        month: getMonth(day),
      };
    });
  }, [data, viewMode, selectedMonth]);

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
    calendarData.forEach((day, index) => {
      const month = day.month;
      if (!positions[month] || index < positions[month]) {
        positions[month] = Math.floor(index / 7);
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

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="year">Year View</option>
            <option value="month">Month View</option>
          </select>

          {viewMode === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          )}
        </div>

        {viewMode === "year" && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last 365 days
          </div>
        )}
      </div>

      {viewMode === "year" ? (
        // Year view - GitHub-style heatmap
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Month labels */}
            <div className="relative h-6 mb-2 ml-10">
              {Object.entries(monthPositions).map(([month, position]) => (
                <div
                  key={month}
                  className="absolute text-xs text-gray-600 dark:text-gray-400"
                  style={{ left: `${position * 13}px` }}
                >
                  {MONTHS[parseInt(month)].substring(0, 3)}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={index}
                    className="h-[13px] text-xs text-gray-600 dark:text-gray-400 flex items-center"
                  >
                    {index % 2 === 1 ? day.substring(0, 3) : ""}
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
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Less
              </span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-[10px] h-[10px] rounded-sm ${getColor(
                    level,
                    isDark
                  )}`}
                />
              ))}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                More
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Month view - Calendar style
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {MONTHS[selectedMonth]} {new Date().getFullYear()}
          </h3>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {weeks?.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`aspect-square p-2 rounded-lg border ${
                    day
                      ? "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600"
                      : "border-transparent"
                  } transition-all`}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {format(day.date, "d")}
                      </div>
                      <div
                        className={`flex-1 rounded ${getColor(
                          day.level,
                          isDark
                        )} ${
                          day.count > 0
                            ? "ring-1 ring-inset ring-gray-200 dark:ring-gray-600"
                            : ""
                        }`}
                      >
                        {day.count > 0 && (
                          <div className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300">
                            {Math.round(day.count / 60)}h
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Total study days:{" "}
                {calendarData.filter((d) => d.count > 0).length}
              </span>
              <span>
                Total hours:{" "}
                {Math.round(
                  calendarData.reduce((sum, d) => sum + d.count, 0) / 60
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Heatmap);
