<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\UserChallenge;
use App\Services\ChallengeService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    protected $challengeService;

    public function __construct(ChallengeService $challengeService)
    {
        $this->challengeService = $challengeService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Get or create today's challenges
        $dailyChallenges = $this->challengeService->getDailyChallenges($user);
        $weeklyChallenges = $this->challengeService->getWeeklyChallenges($user);

        return response()->json([
            'daily' => $dailyChallenges,
            'weekly' => $weeklyChallenges,
        ]);
    }

    public function progress(Request $request)
    {
        $user = $request->user();

        $todayProgress = UserChallenge::where('user_id', $user->id)
            ->where('challenge_date', Carbon::today())
            ->with('challenge')
            ->get()
            ->map(function ($userChallenge) {
                return [
                    'id' => $userChallenge->challenge->id,
                    'name' => $userChallenge->challenge->name,
                    'description' => $userChallenge->challenge->description,
                    'icon' => $userChallenge->challenge->icon,
                    'current_progress' => $userChallenge->current_progress,
                    'requirement_value' => $userChallenge->challenge->requirement_value,
                    'is_completed' => $userChallenge->is_completed,
                    'xp_reward' => $userChallenge->challenge->xp_reward,
                    'progress_percentage' => min(100, round(
                        ($userChallenge->current_progress / $userChallenge->challenge->requirement_value) * 100
                    )),
                ];
            });

        return response()->json([
            'challenges' => $todayProgress,
            'completed_count' => $todayProgress->where('is_completed', true)->count(),
        ]);
    }
}
