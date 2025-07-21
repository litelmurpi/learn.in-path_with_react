<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'challenge_id',
        'current_progress',
        'is_completed',
        'completed_at',
        'challenge_date',
        'week_number',
        'year',
    ];

    protected $casts = [
        'current_progress' => 'integer',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'challenge_date' => 'date',
        'week_number' => 'integer',
        'year' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function updateProgress($amount)
    {
        $this->current_progress += $amount;

        if ($this->current_progress >= $this->challenge->requirement_value && !$this->is_completed) {
            $this->is_completed = true;
            $this->completed_at = now();

            // Add XP reward
            $this->user->userLevel->addXP($this->challenge->xp_reward);
        }

        $this->save();
    }
}
