<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlogFactory extends Factory
{
    protected $model = Blog::class;

    public function definition(): array
    {
        return [
            'title'        => fake()->sentence(5),
            'content'      => fake()->paragraphs(10, true),
            'blog_pic_url' => 'https://picsum.photos/seed/' . fake()->uuid . '/800/400',
            'author_name'  => fake()->name(),
            'time_read'    => fake()->numberBetween(2, 10) . ' mins read',
            'category_id'  => Category::inRandomOrder()->first()?->id ?? Category::factory(),
            'submitted_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'is_featured'  => false,
            'is_popular'   => false,
            'likes_count'  => 0,
        ];
    }
}
