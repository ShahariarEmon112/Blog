<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;
use App\Models\Blog;
use App\Models\Category;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->per_page ?: 6, 50);
        $sort    = $request->sort ?? 'created_at';
        $order   = $request->order ?? 'desc';
        $search  = $request->search;
        $category = $request->category;

        $blogs = Blog::with('category')
            ->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))
            ->when($category, function ($q) use ($category) {
                $q->whereHas('category', fn($c) => $c->where('slug', $category)->orWhere('id', $category));
            })
            ->orderBy($sort, $order)
            ->paginate($perPage);

        return BlogResource::collection($blogs);
    }

    public function show(Blog $blog)
    {
        $blog->load(['category', 'author', 'comments.user', 'comments.replies.user']);

        return new BlogResource($blog);
    }

    public function featured()
    {
        return BlogResource::collection(
            Blog::with('category')->where('is_featured', true)->latest()->get()
        );
    }

    public function popular()
    {
        return BlogResource::collection(
            Blog::with('category')->withCount('favorites')->orderByDesc('favorites_count')->take(10)->get()
        );
    }

    public function byCategory(string $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $blogs = Blog::with('category')
            ->where('category_id', $category->id)
            ->latest()
            ->paginate(6);

        return BlogResource::collection($blogs);
    }

    public function mine(Request $request)
    {
        return BlogResource::collection(
            Blog::with('category')
                ->where('submitted_by', $request->user()->id)
                ->latest()
                ->get()
        );
    }
}
