<?php

use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StudyLogController;
use Illuminate\Support\Facades\Route;

// Debug route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/heatmap', [DashboardController::class, 'heatmap']);

    // Study Logs
    Route::apiResource('study-logs', StudyLogController::class);
    Route::get('/study-logs/by-date', [StudyLogController::class, 'byDate']);

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index']);

    // Achievements
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::post('/achievements/{achievement}/claim', [AchievementController::class, 'claim']);
    Route::get('/achievements/check', [AchievementController::class, 'checkNewAchievements']);

    // Challenges
    Route::get('/challenges', [ChallengeController::class, 'index']);
    Route::get('/challenges/progress', [ChallengeController::class, 'progress']);
});

Route::get('/debug/achievements', function () {
    return response()->json([
        'total_achievements' => \App\Models\Achievement::count(),
        'active_achievements' => \App\Models\Achievement::where('is_active', true)->count(),
        'all_achievements' => \App\Models\Achievement::all()
    ]);
});
