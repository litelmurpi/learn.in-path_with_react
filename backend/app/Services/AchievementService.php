<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\StudyLog;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\Carbon;

class AchievementService
{
    public function checkUserAchievements(User $user)
    {
        $newAchievements = [];
        $achievements = Achievement::active()->get();

        foreach ($achievements as $achievement) {
            // Skip if already unlocked
            if ($user->achievements()->where('achievement_id', $achievement->id)->exists()) {
                continue;
            }

            if ($this->checkAchievementCriteria($user, $achievement)) {
                $userAchievement = UserAchievement::create([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'unlocked_at' => now(),
                ]);

                $newAchievements[] = [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'xp_reward' => $achievement->xp_reward,
                ];
            }
        }

        return $newAchievements;
    }

    protected function checkAchievementCriteria(User $user, Achievement $achievement)
    {
        switch ($achievement->requirement_type) {
            case 'total_hours':
                $totalMinutes = $user->studyLogs()->sum('duration_minutes');
                return ($totalMinutes / 60) >= $achievement->requirement_value;

            case 'streak_days':
                return $user->longest_streak >= $achievement->requirement_value;

            case 'topic_hours':
                if (!$achievement->requirement_topic) {
                    return false;
                }
                $topicMinutes = $user->studyLogs()
                    ->where('topic', $achievement->requirement_topic)
                    ->sum('duration_minutes');
                return ($topicMinutes / 60) >= $achievement->requirement_value;

            case 'sessions_count':
                return $user->studyLogs()->count() >= $achievement->requirement_value;

            case 'early_bird': // Sessions before 6 AM
                return $user->studyLogs()
                    ->whereTime('created_at', '<', '06:00:00')
                    ->count() >= $achievement->requirement_value;

            case 'night_owl': // Sessions after 10 PM
                return $user->studyLogs()
                    ->whereTime('created_at', '>', '22:00:00')
                    ->count() >= $achievement->requirement_value;

            default:
                return false;
        }
    }

    public function getProgress(User $user, Achievement $achievement)
    {
        $current = 0;
        $target = $achievement->requirement_value;

        switch ($achievement->requirement_type) {
            case 'total_hours':
                $totalMinutes = $user->studyLogs()->sum('duration_minutes');
                $current = round($totalMinutes / 60, 1);
                break;

            case 'streak_days':
                $current = $user->longest_streak;
                break;

            case 'topic_hours':
                if ($achievement->requirement_topic) {
                    $topicMinutes = $user->studyLogs()
                        ->where('topic', $achievement->requirement_topic)
                        ->sum('duration_minutes');
                    $current = round($topicMinutes / 60, 1);
                }
                break;

            case 'sessions_count':
                $current = $user->studyLogs()->count();
                break;
        }

        return [
            'current' => $current,
            'target' => $target,
            'percentage' => min(100, round(($current / $target) * 100)),
        ];
    }
}
