<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\Category;
use App\Models\Comment;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->admin()->create();
        User::factory(10)->active()->create();
        User::factory(2)->pending()->create();

        Category::factory(10)->create();
        Blog::factory(30)->create();

        Blog::inRandomOrder()->take(5)->update(['is_featured' => true]);
        Blog::inRandomOrder()->take(5)->update(['is_popular' => true]);

        Blog::all()->each(fn ($b) => Comment::factory(rand(3, 6))->create(['blog_id' => $b->id]));

        SiteSetting::firstOrCreate([], [
            'site_title'    => 'ClassRoom Writes',
            'hero_title'    => 'Thoughts Meet Words',
            'hero_subtitle' => 'A space for student writers to share stories.',
            'footer_text'   => 'Built for young writers.',
            'social_links'  => ['twitter' => '', 'linkedin' => '', 'instagram' => ''],
            'about_page'    => ['name' => 'MD. Shahariar Emon Saikat', 'bio' => 'Founder'],
            'contact_page'  => ['heading' => 'Contact Us'],
        ]);
    }
}
