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
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name');
            $table->string('author_avatar')->nullable();
            $table->string('author_details')->nullable();
            $table->string('blog_pic_url')->nullable();
            $table->string('time_read')->default('3 mins read');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->unsignedInteger('likes_count')->default(0);
            $table->date('publish_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
