<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Challenge;
use Illuminate\Database\Seeder;

class GamificationSeeder extends Seeder
{
    public function run()
    {
        // Achievements
        $achievements = [
            // Milestone Achievements
            ['name' => 'First Steps', 'description' => 'Complete your first study session', 'icon' => '🎯', 'category' => 'milestone', 'requirement_type' => 'sessions_count', 'requirement_value' => 1, 'xp_reward' => 50, 'sort_order' => 1],
            ['name' => 'Getting Started', 'description' => 'Complete 10 study sessions', 'icon' => '📚', 'category' => 'milestone', 'requirement_type' => 'sessions_count', 'requirement_value' => 10, 'xp_reward' => 100, 'sort_order' => 2],
            ['name' => 'Dedicated Learner', 'description' => 'Complete 50 study sessions', 'icon' => '🎓', 'category' => 'milestone', 'requirement_type' => 'sessions_count', 'requirement_value' => 50, 'xp_reward' => 200, 'sort_order' => 3],
            ['name' => 'Study Master', 'description' => 'Complete 100 study sessions', 'icon' => '🏆', 'category' => 'milestone', 'requirement_type' => 'sessions_count', 'requirement_value' => 100, 'xp_reward' => 500, 'sort_order' => 4],

            // Hour Achievements
            ['name' => 'Hour Power', 'description' => 'Study for 1 hour total', 'icon' => '⏰', 'category' => 'milestone', 'requirement_type' => 'total_hours', 'requirement_value' => 1, 'xp_reward' => 50, 'sort_order' => 5],
            ['name' => 'Time Investor', 'description' => 'Study for 10 hours total', 'icon' => '⏱️', 'category' => 'milestone', 'requirement_type' => 'total_hours', 'requirement_value' => 10, 'xp_reward' => 150, 'sort_order' => 6],
            ['name' => 'Century Club', 'description' => 'Study for 100 hours total', 'icon' => '💯', 'category' => 'milestone', 'requirement_type' => 'total_hours', 'requirement_value' => 100, 'xp_reward' => 1000, 'sort_order' => 7],

            // Streak Achievements
            ['name' => 'Consistent Learner', 'description' => 'Maintain a 7-day streak', 'icon' => '🔥', 'category' => 'streak', 'requirement_type' => 'streak_days', 'requirement_value' => 7, 'xp_reward' => 200, 'sort_order' => 10],
            ['name' => 'Streak Master', 'description' => 'Maintain a 30-day streak', 'icon' => '🌟', 'category' => 'streak', 'requirement_type' => 'streak_days', 'requirement_value' => 30, 'xp_reward' => 500, 'sort_order' => 11],
            ['name' => 'Unstoppable', 'description' => 'Maintain a 100-day streak', 'icon' => '💫', 'category' => 'streak', 'requirement_type' => 'streak_days', 'requirement_value' => 100, 'xp_reward' => 2000, 'sort_order' => 12],

            // Special Achievements
            ['name' => 'Early Bird', 'description' => 'Complete 10 sessions before 6 AM', 'icon' => '🌅', 'category' => 'special', 'requirement_type' => 'early_bird', 'requirement_value' => 10, 'xp_reward' => 300, 'sort_order' => 20],
            ['name' => 'Night Owl', 'description' => 'Complete 10 sessions after 10 PM', 'icon' => '🦉', 'category' => 'special', 'requirement_type' => 'night_owl', 'requirement_value' => 10, 'xp_reward' => 300, 'sort_order' => 21],
        ];

        foreach ($achievements as $achievement) {
            Achievement::create($achievement);
        }

        // Challenges
        $challenges = [
            // Daily Challenges
            ['name' => 'Daily Focus', 'description' => 'Study for 30 minutes today', 'type' => 'daily', 'requirement_type' => 'study_minutes', 'requirement_value' => 30, 'xp_reward' => 25, 'icon' => '📖'],
            ['name' => 'Power Hour', 'description' => 'Study for 60 minutes today', 'type' => 'daily', 'requirement_type' => 'study_minutes', 'requirement_value' => 60, 'xp_reward' => 50, 'icon' => '💪'],
            ['name' => 'Topic Explorer', 'description' => 'Study 2 different topics today', 'type' => 'daily', 'requirement_type' => 'topics_count', 'requirement_value' => 2, 'xp_reward' => 30, 'icon' => '🔍'],

            // Weekly Challenges
            ['name' => 'Weekly Warrior', 'description' => 'Study for 5 hours this week', 'type' => 'weekly', 'requirement_type' => 'study_minutes', 'requirement_value' => 300, 'xp_reward' => 150, 'icon' => '⚔️'],
            ['name' => 'Consistent Week', 'description' => 'Study at least 5 days this week', 'type' => 'weekly', 'requirement_type' => 'sessions_count', 'requirement_value' => 5, 'xp_reward' => 100, 'icon' => '📅'],
        ];

        foreach ($challenges as $challenge) {
            Challenge::create($challenge);
        }
    }
}
