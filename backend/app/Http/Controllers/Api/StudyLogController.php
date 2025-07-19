<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudyLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class StudyLogController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $studyLogs = StudyLog::where('user_id', $request->user()->id)
            ->orderBy('study_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($studyLogs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1|max:1440',
            'study_date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string',
        ]);

        // Check if total minutes for the day doesn't exceed 24 hours
        $existingMinutes = StudyLog::where('user_id', $request->user()->id)
            ->whereDate('study_date', $request->study_date)
            ->sum('duration_minutes');

        if ($existingMinutes + $request->duration_minutes > 1440) {
            return response()->json([
                'message' => 'Total study time for a day cannot exceed 24 hours.',
                'existing_minutes' => $existingMinutes,
                'remaining_minutes' => 1440 - $existingMinutes,
            ], 422);
        }

        $studyLog = StudyLog::create([
            'user_id' => $request->user()->id,
            'topic' => $request->topic,
            'duration_minutes' => $request->duration_minutes,
            'study_date' => $request->study_date,
            'notes' => $request->notes,
        ]);

        // Update user streak
        if (Carbon::parse($request->study_date)->isToday()) {
            $request->user()->updateStreak();
        }

        return response()->json($studyLog, 201);
    }

    public function show(StudyLog $studyLog)
    {
        $this->authorize('view', $studyLog);
        return response()->json($studyLog);
    }

    public function update(Request $request, StudyLog $studyLog)
    {
        $this->authorize('update', $studyLog);

        $request->validate([
            'topic' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1|max:1440',
            'study_date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string',
        ]);

        // Check if total minutes for the day doesn't exceed 24 hours
        $existingMinutes = StudyLog::where('user_id', $request->user()->id)
            ->whereDate('study_date', $request->study_date)
            ->where('id', '!=', $studyLog->id)
            ->sum('duration_minutes');

        if ($existingMinutes + $request->duration_minutes > 1440) {
            return response()->json([
                'message' => 'Total study time for a day cannot exceed 24 hours.',
                'existing_minutes' => $existingMinutes,
                'remaining_minutes' => 1440 - $existingMinutes,
            ], 422);
        }

        $studyLog->update($request->all());

        return response()->json($studyLog);
    }

    public function destroy(StudyLog $studyLog)
    {
        $this->authorize('delete', $studyLog);
        $studyLog->delete();

        return response()->json(['message' => 'Study log deleted successfully']);
    }

    public function byDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $studyLogs = StudyLog::where('user_id', $request->user()->id)
            ->whereDate('study_date', $request->date)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($studyLogs);
    }
}
