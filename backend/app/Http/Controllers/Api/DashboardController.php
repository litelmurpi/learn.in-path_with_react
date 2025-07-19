<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudyLog;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        // Get today's study time
        $todayMinutes = StudyLog::where('user_id', $user->id)
            ->whereDate('study_date', $today)
            ->sum('duration_minutes');

        // Get total study time
        $totalMinutes = StudyLog::where('user_id', $user->id)
            ->sum('duration_minutes');

        // Get recent activities
        $recentActivities = StudyLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'current_streak' => $user->current_streak,
            'today_hours' => round($todayMinutes / 60, 2),
            'total_hours' => round($totalMinutes / 60, 2),
            'recent_activities' => $recentActivities,
        ]);
    }

    public function heatmap(Request $request)
    {
        $user = $request->user();
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays(365);

        $studyLogs = StudyLog::where('user_id', $user->id)
            ->whereBetween('study_date', [$startDate, $endDate])
            ->groupBy('study_date')
            ->selectRaw('study_date, SUM(duration_minutes) as total_minutes')
            ->get()
            ->keyBy(function ($item) {
                return $item->study_date->format('Y-m-d');
            });

        $heatmapData = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $minutes = isset($studyLogs[$dateStr]) ? $studyLogs[$dateStr]->total_minutes : 0;

            $heatmapData[] = [
                'date' => $dateStr,
                'count' => $minutes,
                'level' => $this->getIntensityLevel($minutes),
            ];

            $currentDate->addDay();
        }

        return response()->json($heatmapData);
    }

    private function getIntensityLevel($minutes)
    {
        if ($minutes === 0) return 0;
        if ($minutes < 30) return 1;
        if ($minutes < 60) return 2;
        if ($minutes < 120) return 3;
        return 4;
    }
}
