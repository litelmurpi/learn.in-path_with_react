<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StudyLog;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        // Create sample study logs
        $topics = ['Mathematics', 'Physics', 'Programming', 'English', 'Chemistry'];

        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // Random chance to have studied that day
            if (rand(0, 100) < 70) {
                $numSessions = rand(1, 3);

                for ($j = 0; $j < $numSessions; $j++) {
                    StudyLog::create([
                        'user_id' => $user->id,
                        'topic' => $topics[array_rand($topics)],
                        'duration_minutes' => rand(30, 180),
                        'study_date' => $date,
                        'notes' => 'Sample study session',
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);
                }
            }
        }

        $user->updateStreak();
    }
}
