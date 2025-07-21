<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('challenge_id')->constrained()->onDelete('cascade');
            $table->integer('current_progress')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->date('challenge_date'); // for daily challenges
            $table->integer('week_number')->nullable(); // for weekly challenges
            $table->integer('year')->nullable(); // for weekly challenges
            $table->timestamps();

            $table->index(['user_id', 'challenge_date']);
            $table->index(['user_id', 'week_number', 'year']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_challenges');
    }
};
