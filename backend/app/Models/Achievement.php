<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'category',
        'requirement_type',
        'requirement_value',
        'requirement_topic',
        'xp_reward',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'requirement_value' => 'integer',
        'xp_reward' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function userAchievements()
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
