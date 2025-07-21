<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('has_used_streak_freeze_today')->default(false)->after('last_study_date');
            $table->integer('longest_streak')->default(0)->after('current_streak');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['has_used_streak_freeze_today', 'longest_streak']);
        });
    }
};
