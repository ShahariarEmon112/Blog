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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'banned'])->default('pending')->after('email');
            $table->boolean('is_super_user')->default(false)->after('status');
            $table->string('avatar')->nullable()->after('is_super_user');
            $table->string('author_details')->nullable()->after('avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'is_super_user', 'avatar', 'author_details']);
        });
    }
};
