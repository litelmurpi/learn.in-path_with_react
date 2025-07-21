<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'requirement_type',
        'requirement_value',
        'xp_reward',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'requirement_value' => 'integer',
        'xp_reward' => 'integer',
        'is_active' => 'boolean',
    ];

    public function userChallenges()
    {
        return $this->hasMany(UserChallenge::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDaily($query)
    {
        return $query->where('type', 'daily');
    }

    public function scopeWeekly($query)
    {
        return $query->where('type', 'weekly');
    }
}
