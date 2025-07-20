<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DashboardStatsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'user_name' => $this->user_name,
            'current_streak' => intval($this->current_streak),
            'today_hours' => round($this->today_hours, 1),
            'total_hours' => round($this->total_hours, 1),
            'recent_activities' => $this->recent_activities,
        ];
    }
}
