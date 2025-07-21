<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('current_level')->default(1);
            $table->integer('current_xp')->default(0);
            $table->integer('total_xp')->default(0);
            $table->integer('streak_freeze_available')->default(2);
            $table->date('last_streak_freeze_used')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index(['current_level', 'current_xp']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_levels');
    }
};
