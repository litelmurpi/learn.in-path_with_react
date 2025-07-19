<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('study_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('topic');
            $table->integer('duration_minutes');
            $table->date('study_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'study_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('study_logs');
    }
};
