<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\User;
use App\Models\UserLevel;

return new class extends Migration
{
    public function up()
    {
        // Get all users without user levels
        $users = User::whereDoesntHave('userLevel')->get();

        foreach ($users as $user) {
            UserLevel::create([
                'user_id' => $user->id,
                'current_level' => 1,
                'current_xp' => 0,
                'total_xp' => 0,
                'streak_freeze_available' => 2,
            ]);
        }
    }

    public function down()
    {
        // No need to reverse this
    }
};
