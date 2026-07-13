<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlogFactory extends Factory
{
    protected $model = Blog::class;

    private static array $titles = [
        'How I Overcame My Fear of Public Speaking',
        'Top 10 Study Techniques That Actually Work',
        'Why Reading Books Makes You a Better Writer',
        'A Beginner\'s Guide to Starting a Blog',
        'The Importance of Mental Health for Students',
        'How to Stay Motivated During Exam Season',
        'My Experience Volunteering at a Local Shelter',
        '5 Habits of Highly Successful Students',
        'How Social Media Affects Our Daily Lives',
        'The Art of Writing a Powerful Essay',
        'Why You Should Start Learning a New Language',
        'Tips for Balancing School and Personal Life',
        'How I Built My First Website from Scratch',
        'The Benefits of Joining a Study Group',
        'How to Prepare for College Applications',
        'Why Critical Thinking Matters More Than Ever',
        'My Journey to Becoming a Better Public Speaker',
        'How to Make Friends in a New School',
        'The Power of Keeping a Daily Journal',
        'Understanding Climate Change: A Student\'s Perspective',
        'How to Manage Stress Without Burning Out',
        'Why Extracurricular Activities Matter',
        'The Best Ways to Take Notes in Class',
        'How I Improved My Writing Skills in 30 Days',
        'Dealing with Peer Pressure as a Teen',
        'Why Everyone Should Try Creative Writing',
        'How to Set Goals and Actually Achieve Them',
        'The Role of Technology in Modern Education',
        'How I Found My Passion for Science',
        'Lessons I Learned from My First Part-Time Job',
        'Why You Should Travel While You Are Young',
        'How to Build Confidence in the Classroom',
        'The Impact of Music on Studying and Focus',
        'How to Write a Resume That Stands Out',
        'Why Team Sports Teach Life Skills',
    ];

    private static array $bodies = [];

    public function definition(): array
    {
        $title = static::$titles[array_rand(static::$titles)];
        $content = $this->generateContent($title);

        return [
            'title'        => $title,
            'content'      => $content,
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

    private function generateContent(string $title): string
    {
        $paragraphs = [
            "Have you ever thought about this topic deeply? Many students face similar questions every day, and yet we rarely take the time to explore them. In this article, I want to share my personal experience and what I have learned along the way.",
            "When I first started thinking about this subject, I had no idea how much it would change my perspective. It all began during my sophomore year when a teacher introduced me to a new way of looking at things. That single moment sparked a curiosity that has stayed with me ever since.",
            "One of the most important lessons I have learned is that progress takes time. There is no shortcut to mastery, but every small step counts. Whether you are studying for an exam, learning a new skill, or working on a personal project, consistency matters more than talent.",
            "I remember struggling at first. There were days when I wanted to give up because the results were not visible. But looking back, those struggles were the very things that helped me grow the most. Challenges are not roadblocks — they are stepping stones.",
            "Another thing I discovered is the power of community. Surrounding yourself with like-minded people who share your goals makes a huge difference. They keep you accountable, motivate you when you are down, and celebrate your wins with you.",
            "If you are reading this and feeling unsure about your own journey, know that you are not alone. Everyone starts somewhere. What matters is that you keep going, keep learning, and keep believing in yourself.",
            "I hope this article has given you something to think about. Try applying even one idea from this post in your daily life. You might be surprised at how much of a difference it can make. Thank you for reading, and feel free to share your own thoughts in the comments below!",
        ];

        return implode("\n\n", $paragraphs);
    }
}
