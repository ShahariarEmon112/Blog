<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AvatarSeeder extends Seeder
{
    public function run(): void
    {
        User::all()->each(function ($user) {
            $name = urlencode($user->name);
            $user->avatar = "https://ui-avatars.com/api/?name={$name}&background=random&color=fff&size=128&bold=true";
            $user->save();
        });
    }
}
