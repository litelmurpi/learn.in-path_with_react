<?php

namespace App\Policies;

use App\Models\StudyLog;
use App\Models\User;

class StudyLogPolicy
{
    public function view(User $user, StudyLog $studyLog)
    {
        return $user->id === $studyLog->user_id;
    }

    public function update(User $user, StudyLog $studyLog)
    {
        return $user->id === $studyLog->user_id;
    }

    public function delete(User $user, StudyLog $studyLog)
    {
        return $user->id === $studyLog->user_id;
    }
}
