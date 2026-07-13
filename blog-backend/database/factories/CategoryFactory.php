<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    private static array $names = [
        'Technology', 'Science', 'Literature', 'History',
        'Education', 'Health', 'Lifestyle', 'Travel',
        'Business', 'Sports', 'Art', 'Music',
        'Food', 'Fashion', 'Environment', 'Culture',
        'Philosophy', 'Psychology', 'Politics', 'Photography',
    ];

    private static int $index = 0;

    public function definition(): array
    {
        $name = static::$names[static::$index % count(static::$names)];
        static::$index++;

        return [
            'name'  => $name,
            'slug'  => Str::slug($name),
            'image' => 'https://picsum.photos/seed/' . fake()->uuid . '/400/300',
        ];
    }
}
