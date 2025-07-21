<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAchievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'achievement_id',
        'unlocked_at',
        'is_claimed',
        'claimed_at',
    ];

    protected $casts = [
        'unlocked_at' => 'datetime',
        'claimed_at' => 'datetime',
        'is_claimed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function achievement()
    {
        return $this->belongsTo(Achievement::class);
    }

    public function claim()
    {
        $this->update([
            'is_claimed' => true,
            'claimed_at' => now(),
        ]);

        // Add XP to user
        $userLevel = $this->user->userLevel;
        $userLevel->addXP($this->achievement->xp_reward);
    }
}
