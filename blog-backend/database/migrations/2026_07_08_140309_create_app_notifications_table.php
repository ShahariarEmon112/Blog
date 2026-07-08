<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('action_by_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('blog_id')->constrained()->cascadeOnDelete();
            $table->foreignId('comment_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('type', ['like', 'comment', 'favorite', 'request_approved']);
            $table->boolean('read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
