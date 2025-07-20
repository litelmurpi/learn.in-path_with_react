<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic',
        'duration_minutes',
        'study_date',
        'notes',
    ];

    protected $casts = [
        'study_date' => 'date',
        'duration_minutes' => 'integer',
    ];

    protected $appends = ['duration_hours'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getDurationHoursAttribute()
    {
        return round($this->duration_minutes / 60, 1); // Always 1 decimal place
    }

    // Override toArray to ensure consistent formatting
    public function toArray()
    {
        $array = parent::toArray();

        // Ensure duration_minutes is integer
        if (isset($array['duration_minutes'])) {
            $array['duration_minutes'] = intval($array['duration_minutes']);
        }

        // Format duration_hours to 1 decimal place
        if (isset($array['duration_hours'])) {
            $array['duration_hours'] = round($array['duration_hours'], 1);
        }

        return $array;
    }
}
