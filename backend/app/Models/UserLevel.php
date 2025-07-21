<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_level',
        'current_xp',
        'total_xp',
        'streak_freeze_available',
        'last_streak_freeze_used',
    ];

    protected $casts = [
        'current_level' => 'integer',
        'current_xp' => 'integer',
        'total_xp' => 'integer',
        'streak_freeze_available' => 'integer',
        'last_streak_freeze_used' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function addXP($amount)
    {
        $this->total_xp += $amount;
        $this->current_xp += $amount;

        // Check for level up
        while ($this->current_xp >= $this->getXPForNextLevel()) {
            $this->current_xp -= $this->getXPForNextLevel();
            $this->current_level++;
        }

        $this->save();
    }

    public function getXPForNextLevel()
    {
        // XP required increases with level
        return 100 * pow(1.5, $this->current_level - 1);
    }

    public function getProgressPercentage()
    {
        $requiredXP = $this->getXPForNextLevel();
        return min(100, round(($this->current_xp / $requiredXP) * 100));
    }

    public function getLevelName()
    {
        $levels = [
            1 => 'Beginner',
            5 => 'Student',
            10 => 'Scholar',
            20 => 'Expert',
            30 => 'Master',
            50 => 'Grandmaster',
        ];

        foreach (array_reverse($levels, true) as $level => $name) {
            if ($this->current_level >= $level) {
                return $name;
            }
        }

        return 'Beginner';
    }

    public function useStreakFreeze()
    {
        if (
            $this->streak_freeze_available > 0 &&
            (!$this->last_streak_freeze_used || !$this->last_streak_freeze_used->isToday())
        ) {
            $this->streak_freeze_available--;
            $this->last_streak_freeze_used = now();
            $this->save();
            return true;
        }
        return false;
    }
}
