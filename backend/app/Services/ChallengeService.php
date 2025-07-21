<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\User;
use App\Models\UserChallenge;
use Carbon\Carbon;

class ChallengeService
{
    public function getDailyChallenges(User $user)
    {
        $today = Carbon::today();

        // Get active daily challenges
        $dailyChallenges = Challenge::active()->daily()->get();

        $userChallenges = [];

        foreach ($dailyChallenges as $challenge) {
            // Get or create user challenge for today
            $userChallenge = UserChallenge::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'challenge_id' => $challenge->id,
                    'challenge_date' => $today,
                ],
                [
                    'current_progress' => 0,
                    'is_completed' => false,
                ]
            );

            $userChallenges[] = [
                'id' => $challenge->id,
                'name' => $challenge->name,
                'description' => $challenge->description,
                'icon' => $challenge->icon,
                'type' => 'daily',
                'current_progress' => $userChallenge->current_progress,
                'requirement_value' => $challenge->requirement_value,
                'is_completed' => $userChallenge->is_completed,
                'xp_reward' => $challenge->xp_reward,
                'progress_percentage' => min(100, round(
                    ($userChallenge->current_progress / $challenge->requirement_value) * 100
                )),
            ];
        }

        return $userChallenges;
    }

    public function getWeeklyChallenges(User $user)
    {
        $weekNumber = Carbon::now()->weekOfYear;
        $year = Carbon::now()->year;

        // Get active weekly challenges
        $weeklyChallenges = Challenge::active()->weekly()->get();

        $userChallenges = [];

        foreach ($weeklyChallenges as $challenge) {
            // Get or create user challenge for this week
            $userChallenge = UserChallenge::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'challenge_id' => $challenge->id,
                    'week_number' => $weekNumber,
                    'year' => $year,
                ],
                [
                    'current_progress' => 0,
                    'is_completed' => false,
                ]
            );

            $userChallenges[] = [
                'id' => $challenge->id,
                'name' => $challenge->name,
                'description' => $challenge->description,
                'icon' => $challenge->icon,
                'type' => 'weekly',
                'current_progress' => $userChallenge->current_progress,
                'requirement_value' => $challenge->requirement_value,
                'is_completed' => $userChallenge->is_completed,
                'xp_reward' => $challenge->xp_reward,
                'progress_percentage' => min(100, round(
                    ($userChallenge->current_progress / $challenge->requirement_value) * 100
                )),
            ];
        }

        return $userChallenges;
    }

    public function updateChallengeProgress(User $user, $type, $value)
    {
        $today = Carbon::today();
        $weekNumber = Carbon::now()->weekOfYear;
        $year = Carbon::now()->year;

        // Update daily challenges
        $dailyChallenges = $user->challenges()
            ->where('challenge_date', $today)
            ->where('is_completed', false)
            ->whereHas('challenge', function ($query) use ($type) {
                $query->where('requirement_type', $type);
            })
            ->with('challenge')
            ->get();

        foreach ($dailyChallenges as $userChallenge) {
            $userChallenge->updateProgress($value);
        }

        // Update weekly challenges
        $weeklyChallenges = $user->challenges()
            ->where('week_number', $weekNumber)
            ->where('year', $year)
            ->where('is_completed', false)
            ->whereHas('challenge', function ($query) use ($type) {
                $query->where('requirement_type', $type);
            })
            ->with('challenge')
            ->get();

        foreach ($weeklyChallenges as $userChallenge) {
            $userChallenge->updateProgress($value);
        }
    }
}
