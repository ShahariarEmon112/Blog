<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->foreignId('blog_id')->nullable()->change();
        });
        DB::statement("ALTER TABLE app_notifications MODIFY COLUMN type ENUM('like','comment','favorite','request_approved','welcome') NOT NULL DEFAULT 'like'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE app_notifications MODIFY COLUMN type ENUM('like','comment','favorite','request_approved') NOT NULL DEFAULT 'like'");
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->foreignId('blog_id')->nullable(false)->change();
        });
    }
};
