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
            $table->foreign('friend_request_id')->references('id')->on('friend_requests')->cascadeOnDelete();
        });
        DB::statement("ALTER TABLE app_notifications MODIFY COLUMN type ENUM('like','comment','favorite','request_approved','welcome','blog_posted','friend_request','friend_accepted') NOT NULL DEFAULT 'like'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE app_notifications MODIFY COLUMN type ENUM('like','comment','favorite','request_approved','welcome') NOT NULL DEFAULT 'like'");
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropForeign(['friend_request_id']);
        });
    }
};
