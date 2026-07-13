<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('age')->nullable()->after('author_details');
            $table->string('gmail')->nullable()->after('age');
            $table->string('education_status')->nullable()->after('gmail');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['age', 'gmail', 'education_status']);
        });
    }
};
