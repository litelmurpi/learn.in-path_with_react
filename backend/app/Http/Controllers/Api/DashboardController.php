<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudyLog;
use App\Models\UserAchievement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        // Calculate current streak properly
        $currentStreak = $this->calculateCurrentStreak($user->id);

        // Ensure user has level
        $userLevel = $user->ensureUserLevel();

        // Get gamification data
        $unclaimedAchievements = $user->achievements()
            ->where('is_claimed', false)
            ->count();

        $todaysChallenges = $user->challenges()
            ->where('challenge_date', $today)
            ->where('is_completed', false)
            ->count();

        return response()->json([
            'user_name' => $user->name,
            'current_streak' => $currentStreak,
            'longest_streak' => $user->longest_streak,
            'today_hours' => round($todayMinutes / 60, 1),
            'total_hours' => round($totalMinutes / 60, 1),
            'recent_activities' => $recentActivities->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'topic' => $activity->topic,
                    'study_date' => $activity->study_date->format('Y-m-d'),
                    'duration_minutes' => $activity->duration_minutes,
                    'notes' => $activity->notes,
                    'created_at' => $activity->created_at,
                ];
            }),
            'gamification' => [
                'level' => $userLevel->current_level,
                'level_name' => $userLevel->getLevelName(),
                'current_xp' => $userLevel->current_xp,
                'xp_for_next_level' => $userLevel->getXPForNextLevel(),
                'progress_percentage' => $userLevel->getProgressPercentage(),
                'total_xp' => $userLevel->total_xp,
                'unclaimed_achievements' => $unclaimedAchievements,
                'active_challenges' => $todaysChallenges,
                'streak_freeze_available' => $userLevel->streak_freeze_available,
            ],
        ]);
    }

    public function heatmap(Request $request)
    {
        $user = $request->user();
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays(365);

        $studyLogs = StudyLog::where('user_id', $user->id)
            ->whereBetween('study_date', [$startDate, $endDate])
            ->select('study_date', DB::raw('SUM(duration_minutes) as total_minutes'), DB::raw('COUNT(id) as sessions'))
            ->groupBy('study_date')
            ->get()
            ->keyBy(function ($item) {
                return $item->study_date->format('Y-m-d');
            });

        $heatmapData = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $log = isset($studyLogs[$dateStr]) ? $studyLogs[$dateStr] : null;
            $minutes = $log ? $log->total_minutes : 0;
            $sessions = $log ? $log->sessions : 0;

            $heatmapData[] = [
                'date' => $dateStr,
                'count' => intval($minutes),
                'level' => $this->getIntensityLevel($minutes),
                'sessions' => intval($sessions),
            ];

            $currentDate->addDay();
        }

        return response()->json($heatmapData);
    }

    private function getIntensityLevel($minutes)
    {
        $hours = $minutes / 60;

        if ($hours === 0) return 0;
        if ($hours < 1) return 1;
        if ($hours < 2) return 2;
        if ($hours < 4) return 3;
        if ($hours < 6) return 4;
        return 5;
    }

    private function calculateCurrentStreak($userId)
    {
        $today = Carbon::today();
        $streak = 0;

        // Check if studied today
        $studiedToday = StudyLog::where('user_id', $userId)
            ->whereDate('study_date', $today)
            ->exists();

        // Start from today if studied, otherwise from yesterday
        $checkDate = $studiedToday ? $today : $today->copy()->subDay();

        while (true) {
            $hasStudy = StudyLog::where('user_id', $userId)
                ->whereDate('study_date', $checkDate)
                ->exists();

            if ($hasStudy) {
                $streak++;
                $checkDate->subDay();
            } else {
                break;
            }

            // Prevent infinite loop
            if ($streak > 365) break;
        }

        return $streak;
    }
}
