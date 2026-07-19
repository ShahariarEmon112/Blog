<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    protected $model = Comment::class;

    private static array $englishTexts = [
        'This is a wonderful article! Very helpful for students like me.',
        'I totally agree with your points. Keep up the great work!',
        'Thanks for sharing your experience. It really inspired me.',
        'Can you write more about this topic? I found it very insightful.',
        'I have tried this method and it works perfectly. Great advice!',
        'Well written! I shared this with my classmates.',
        'This is exactly what I needed to read today. Thank you!',
        'I have a different perspective on this, but I respect your opinion.',
        'Amazing content! Looking forward to more articles from you.',
        'Could you provide some references for the statistics mentioned?',
        'This changed my way of thinking. Really powerful stuff.',
        'Simple yet effective tips. I will definitely try these out.',
    ];

    public function definition(): array
    {
        return [
            'text'    => self::$englishTexts[array_rand(self::$englishTexts)],
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
        ];
    }
}
