<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Category;
use App\Models\User;
use App\Services\QuoteService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(string $section, QuoteService $quotes)
    {
        abort_unless(in_array($section, ['overview', 'blogs', 'users']), 404);

        $stats = [
            'blogs'      => Blog::count(),
            'users'      => User::count(),
            'pending'    => User::where('status', 'pending')->count(),
            'categories' => Category::count(),
        ];

        $recentBlogs = Blog::latest()->take(5)->get();
        $quote = $quotes->quoteOfTheDay();

        return view('dashboard.section', compact('section', 'stats', 'recentBlogs', 'quote'));
    }
}
