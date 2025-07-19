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
        'last_study_date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_study_date' => 'date',
    ];

    public function studyLogs()
    {
        return $this->hasMany(StudyLog::class);
    }

    public function updateStreak()
    {
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        if ($this->last_study_date === null) {
            $this->current_streak = 1;
        } elseif ($this->last_study_date->toDateString() === $today) {
            // Already studied today, no change
            return;
        } elseif ($this->last_study_date->toDateString() === $yesterday) {
            $this->current_streak++;
        } else {
            $this->current_streak = 1;
        }

        $this->last_study_date = $today;
        $this->save();
    }
}
