<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudyLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'overview' => $this->getOverview($user),
            'daily_chart' => $this->getDailyChart($user),
            'topics_distribution' => $this->getTopicsDistribution($user),
            'weekly_pattern' => $this->getWeeklyPattern($user),
            'hourly_pattern' => $this->getHourlyPattern($user),
            'insights' => $this->getInsights($user),
        ]);
    }

    private function getOverview($user)
    {
        $totalMinutes = StudyLog::where('user_id', $user->id)->sum('duration_minutes');
        $totalDays = StudyLog::where('user_id', $user->id)->distinct('study_date')->count('study_date');
        $avgMinutesPerDay = $totalDays > 0 ? $totalMinutes / $totalDays : 0;

        // Calculate consistency (percentage of days studied in last 30 days)
        $last30Days = StudyLog::where('user_id', $user->id)
            ->where('study_date', '>=', Carbon::now()->subDays(30))
            ->distinct('study_date')
            ->count('study_date');
        $consistency = round(($last30Days / 30) * 100);

        return [
            'total_hours' => round($totalMinutes / 60, 2),
            'consistency_percentage' => $consistency,
            'avg_hours_per_day' => round($avgMinutesPerDay / 60, 2),
            'total_days' => $totalDays,
        ];
    }

    private function getDailyChart($user)
    {
        $data = StudyLog::where('user_id', $user->id)
            ->where('study_date', '>=', Carbon::now()->subDays(7))
            ->groupBy('study_date')
            ->selectRaw('study_date, SUM(duration_minutes) as total_minutes')
            ->orderBy('study_date')
            ->get();

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $dayData = $data->firstWhere('study_date', $dateStr);

            $chartData[] = [
                'date' => $date->format('M d'),
                'hours' => $dayData ? round($dayData->total_minutes / 60, 2) : 0,
            ];
        }

        return $chartData;
    }

    private function getTopicsDistribution($user)
    {
        $topics = StudyLog::where('user_id', $user->id)
            ->groupBy('topic')
            ->selectRaw('topic, SUM(duration_minutes) as total_minutes')
            ->orderByDesc('total_minutes')
            ->take(5)
            ->get();

        return $topics->map(function ($topic) {
            return [
                'topic' => $topic->topic,
                'hours' => round($topic->total_minutes / 60, 2),
            ];
        });
    }

    private function getWeeklyPattern($user)
    {
        $weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $data = StudyLog::where('user_id', $user->id)
            ->selectRaw('DAYOFWEEK(study_date) as day_of_week, AVG(duration_minutes) as avg_minutes')
            ->groupBy('day_of_week')
            ->get()
            ->keyBy('day_of_week');

        $pattern = [];
        for ($i = 1; $i <= 7; $i++) {
            $dayIndex = $i - 1;
            $pattern[] = [
                'day' => $weekDays[$dayIndex],
                'hours' => isset($data[$i]) ? round($data[$i]->avg_minutes / 60, 2) : 0,
            ];
        }

        return $pattern;
    }

    private function getHourlyPattern($user)
    {
        // This would require a created_at time analysis
        // For now, we'll return mock data
        $pattern = [];
        for ($hour = 0; $hour < 24; $hour++) {
            $pattern[] = [
                'hour' => sprintf('%02d:00', $hour),
                'sessions' => rand(0, 10), // Replace with actual data
            ];
        }

        return $pattern;
    }

    private function getInsights($user)
    {
        $insights = [];

        // Most productive day
        $mostProductiveDay = StudyLog::where('user_id', $user->id)
            ->selectRaw('DAYNAME(study_date) as day_name, AVG(duration_minutes) as avg_minutes')
            ->groupBy('day_name')
            ->orderByDesc('avg_minutes')
            ->first();

        if ($mostProductiveDay) {
            $insights[] = "Your most productive day is {$mostProductiveDay->day_name} with an average of " .
                round($mostProductiveDay->avg_minutes / 60, 1) . " hours.";
        }

        // Streak insight
        if ($user->current_streak > 7) {
            $insights[] = "Great job! You're on a {$user->current_streak}-day streak!";
        } elseif ($user->current_streak > 0) {
            $insights[] = "Keep it up! You've studied for {$user->current_streak} days in a row.";
        }

        // Consistency insight
        $consistency = $this->getOverview($user)['consistency_percentage'];
        if ($consistency >= 80) {
            $insights[] = "Excellent consistency! You've studied {$consistency}% of the last 30 days.";
        } elseif ($consistency < 50) {
            $insights[] = "Try to study more regularly. You've only studied {$consistency}% of the last 30 days.";
        }

        return $insights;
    }
}
