<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->string('icon')->default('🏆');
            $table->string('category'); // milestone, streak, topic, special
            $table->string('requirement_type'); // total_hours, streak_days, topic_hours, sessions_count
            $table->integer('requirement_value');
            $table->string('requirement_topic')->nullable(); // for topic-specific achievements
            $table->integer('xp_reward')->default(100);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('achievements');
    }
};
