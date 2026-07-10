<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'           => fake()->name(),
            'email'          => fake()->unique()->safeEmail(),
            'password'       => static::$password ??= Hash::make('password'),
            'status'         => 'active',
            'is_super_user'  => false,
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state([
            'is_super_user' => true,
            'status'        => 'active',
            'name'          => 'Admin',
            'email'         => 'admin@blog.local',
            'password'      => Hash::make('Admin@123'),
        ]);
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }
}
