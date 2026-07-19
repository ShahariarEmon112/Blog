<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorizeBlogsSeeder extends Seeder
{
    public function run(): void
    {
        $cats = Category::pluck('id', 'name');

        $rules = [
            'Technology' => [
                'first website', 'built my', 'built classroom', 'classroom writes',
                'website', 'blog', 'tech', 'computer', 'programming', 'digital',
                'social media', 'internet', 'software', 'vision behind this platform',
            ],
            'Science' => [
                'climate change', 'science', 'scientific', 'research', 'experiment', 'data',
                'biology', 'chemistry', 'physics', 'environment', 'nature', 'space',
            ],
            'Literature' => [
                'creative writing', 'reading books', 'better writer', 'essay', 'journal',
                'poetry', 'writer', 'author', 'writing skills',
            ],
            'History' => [
                'history', 'ancient', 'past', 'civilization', 'historical', 'world war',
            ],
            'Education' => [
                'prepare for college', 'study techniques', 'study group', 'critical thinking',
                'education system', 'public speaking', 'public speaker',
                'study', 'school', 'college', 'academic', 'learning', 'student', 'class',
                'exam', 'education', 'course', 'homework', 'language', 'note',
                'taking notes',
            ],
            'Health' => [
                'mental health', 'health', 'stress', 'depression', 'anxiety', 'sleep',
                'burning out', 'manage stress',
            ],
            'Lifestyle' => [
                'successful student', 'time management', 'habit', 'lifestyle', 'confidence',
                'hobby', 'passion', 'personal', 'self', 'motivation', 'balance',
                'first experience',
            ],
            'Travel' => [
                'travel while', 'travel', 'trip', 'journey', 'explore', 'adventure',
                'culture', 'abroad',
            ],
            'Business' => [
                'part-time', 'extracurricular', 'business', 'career', 'job', 'entrepreneur',
                'startup', 'finance', 'money', 'leadership', 'application',
            ],
            'Sports' => [
                'sports', 'team sports', 'football', 'cricket', 'basketball', 'game',
                'competition', 'athlete', 'sport',
            ],
        ];

        Blog::all()->each(function ($blog) use ($cats, $rules) {
            $title = strtolower($blog->title);
            $assigned = false;

            foreach ($rules as $categoryName => $keywords) {
                foreach ($keywords as $keyword) {
                    if (str_contains($title, strtolower($keyword))) {
                        $blog->category_id = $cats[$categoryName];
                        $blog->save();
                        $assigned = true;
                        break 2;
                    }
                }
            }

            if (!$assigned) {
                $blog->category_id = $cats['Lifestyle'];
                $blog->save();
            }
        });
    }
}
