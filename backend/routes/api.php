<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
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
});
