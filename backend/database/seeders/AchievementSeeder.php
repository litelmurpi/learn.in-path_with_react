<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Achievement;

class AchievementSeeder extends Seeder
{
    public function run()
    {
        $achievements = [
            // Milestone achievements
            [
                'name' => 'First Step',
                'description' => 'Complete your first study session',
                'category' => 'milestone',
                'requirement_type' => 'study_sessions',
                'requirement_value' => 1,
                'requirement_topic' => null,
                'xp_reward' => 10,
                'icon' => '🎯',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Getting Started',
                'description' => 'Complete 5 study sessions',
                'category' => 'milestone',
                'requirement_type' => 'study_sessions',
                'requirement_value' => 5,
                'requirement_topic' => null,
                'xp_reward' => 25,
                'icon' => '📚',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Dedicated Learner',
                'description' => 'Complete 25 study sessions',
                'category' => 'milestone',
                'requirement_type' => 'study_sessions',
                'requirement_value' => 25,
                'requirement_topic' => null,
                'xp_reward' => 100,
                'icon' => '🎓',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Study Master',
                'description' => 'Complete 100 study sessions',
                'category' => 'milestone',
                'requirement_type' => 'study_sessions',
                'requirement_value' => 100,
                'requirement_topic' => null,
                'xp_reward' => 500,
                'icon' => '🏆',
                'is_active' => true,
                'sort_order' => 4,
            ],

            // Streak achievements
            [
                'name' => '3-Day Streak',
                'description' => 'Study for 3 consecutive days',
                'category' => 'streak',
                'requirement_type' => 'streak_days',
                'requirement_value' => 3,
                'requirement_topic' => null,
                'xp_reward' => 30,
                'icon' => '🔥',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Week Warrior',
                'description' => 'Study for 7 consecutive days',
                'category' => 'streak',
                'requirement_type' => 'streak_days',
                'requirement_value' => 7,
                'requirement_topic' => null,
                'xp_reward' => 75,
                'icon' => '🔥',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Consistency Champion',
                'description' => 'Study for 30 consecutive days',
                'category' => 'streak',
                'requirement_type' => 'streak_days',
                'requirement_value' => 30,
                'requirement_topic' => null,
                'xp_reward' => 300,
                'icon' => '💪',
                'is_active' => true,
                'sort_order' => 3,
            ],

            // Special achievements
            [
                'name' => 'Hour Power',
                'description' => 'Study for a total of 10 hours',
                'category' => 'special',
                'requirement_type' => 'total_hours',
                'requirement_value' => 10,
                'requirement_topic' => null,
                'xp_reward' => 50,
                'icon' => '⏰',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Time Investor',
                'description' => 'Study for a total of 50 hours',
                'category' => 'special',
                'requirement_type' => 'total_hours',
                'requirement_value' => 50,
                'requirement_topic' => null,
                'xp_reward' => 200,
                'icon' => '⏳',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Knowledge Seeker',
                'description' => 'Study for a total of 100 hours',
                'category' => 'special',
                'requirement_type' => 'total_hours',
                'requirement_value' => 100,
                'requirement_topic' => null,
                'xp_reward' => 500,
                'icon' => '🎓',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Early Bird',
                'description' => 'Complete a study session before 6 AM',
                'category' => 'special',
                'requirement_type' => 'time_based',
                'requirement_value' => 6, // 6 AM
                'requirement_topic' => null,
                'xp_reward' => 20,
                'icon' => '🌅',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Night Owl',
                'description' => 'Complete a study session after 11 PM',
                'category' => 'special',
                'requirement_type' => 'time_based',
                'requirement_value' => 23, // 11 PM
                'requirement_topic' => null,
                'xp_reward' => 20,
                'icon' => '🦉',
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::create($achievement);
        }

        $this->command->info('Achievements seeded successfully! Total: ' . count($achievements));
    }
}
