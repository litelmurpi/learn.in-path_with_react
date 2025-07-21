<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'current_streak',
        'longest_streak',
        'last_study_date',
        'has_used_streak_freeze_today',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_study_date' => 'date',
        'current_streak' => 'integer',
        'longest_streak' => 'integer',
        'has_used_streak_freeze_today' => 'boolean',
    ];

    protected static function booted()
    {
        static::created(function ($user) {
            // Create user level record
            $user->userLevel()->create([
                'current_level' => 1,
                'current_xp' => 0,
                'total_xp' => 0,
                'streak_freeze_available' => 2,
            ]);
        });
    }

    public function studyLogs()
    {
        return $this->hasMany(StudyLog::class);
    }

    public function userLevel()
    {
        return $this->hasOne(UserLevel::class);
    }

    public function achievements()
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function challenges()
    {
        return $this->hasMany(UserChallenge::class);
    }

    public function updateStreak()
    {
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        if ($this->last_study_date === null) {
            $this->current_streak = 1;
            $this->longest_streak = max($this->longest_streak, 1);
        } elseif ($this->last_study_date->toDateString() === $today) {
            // Already studied today, no change
            return;
        } elseif ($this->last_study_date->toDateString() === $yesterday) {
            $this->current_streak++;
            $this->longest_streak = max($this->longest_streak, $this->current_streak);
        } else {
            // Check if user can use streak freeze
            if (
                $this->has_used_streak_freeze_today == false &&
                $this->userLevel &&
                $this->userLevel->streak_freeze_available > 0
            ) {
                // Streak continues with freeze
                $this->has_used_streak_freeze_today = true;
                $this->userLevel->useStreakFreeze();
            } else {
                // Streak broken
                $this->current_streak = 1;
            }
        }

        $this->last_study_date = $today;
        $this->save();
    }

    // Helper method to ensure user has level
    public function ensureUserLevel()
    {
        if (!$this->userLevel) {
            $this->userLevel()->create([
                'current_level' => 1,
                'current_xp' => 0,
                'total_xp' => 0,
                'streak_freeze_available' => 2,
            ]);
        }
        return $this->userLevel;
    }
}
