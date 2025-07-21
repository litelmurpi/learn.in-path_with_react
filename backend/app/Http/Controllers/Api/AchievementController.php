<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Services\AchievementService;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    protected $achievementService;

    public function __construct(AchievementService $achievementService)
    {
        $this->achievementService = $achievementService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $achievements = Achievement::active()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($achievement) use ($user) {
                $userAchievement = $user->achievements()
                    ->where('achievement_id', $achievement->id)
                    ->first();

                return [
                    'id' => $achievement->id,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'category' => $achievement->category,
                    'xp_reward' => $achievement->xp_reward,
                    'is_unlocked' => $userAchievement ? true : false,
                    'is_claimed' => $userAchievement ? $userAchievement->is_claimed : false,
                    'unlocked_at' => $userAchievement ? $userAchievement->unlocked_at : null,
                    'progress' => $this->achievementService->getProgress($user, $achievement),
                ];
            });

        $stats = [
            'total' => $achievements->count(),
            'unlocked' => $achievements->where('is_unlocked', true)->count(),
            'claimed' => $achievements->where('is_claimed', true)->count(),
        ];

        return response()->json([
            'achievements' => $achievements->groupBy('category'),
            'stats' => $stats,
        ]);
    }

    public function claim(Request $request, $achievementId)
    {
        $user = $request->user();

        $userAchievement = UserAchievement::where('user_id', $user->id)
            ->where('achievement_id', $achievementId)
            ->where('is_claimed', false)
            ->first();

        if (!$userAchievement) {
            return response()->json([
                'message' => 'Achievement not found or already claimed',
            ], 404);
        }

        $userAchievement->claim();

        return response()->json([
            'message' => 'Achievement claimed successfully',
            'xp_gained' => $userAchievement->achievement->xp_reward,
            'user_level' => [
                'level' => $user->userLevel->current_level,
                'xp' => $user->userLevel->current_xp,
                'total_xp' => $user->userLevel->total_xp,
                'progress' => $user->userLevel->getProgressPercentage(),
            ],
        ]);
    }

    public function checkNewAchievements(Request $request)
    {
        $user = $request->user();
        $newAchievements = $this->achievementService->checkUserAchievements($user);

        return response()->json([
            'new_achievements' => $newAchievements,
            'count' => count($newAchievements),
        ]);
    }
}
