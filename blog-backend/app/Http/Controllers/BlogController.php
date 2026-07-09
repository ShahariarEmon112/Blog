<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::with('category')->latest()->paginate(10);

        return view('blogs.index', compact('blogs'));
    }

    public function create()
    {
        $categories = Category::all();

        return view('blogs.create', compact('categories'));
    }

    public function store(StoreBlogRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('blog_pic')) {
            $data['blog_pic_url'] = $request->file('blog_pic')->store('blogs', 'public');
        }

        if ($request->hasFile('author_avatar')) {
            $data['author_avatar'] = $request->file('author_avatar')->store('avatars', 'public');
        }

        $data['is_featured'] = $request->boolean('is_featured');
        $data['submitted_by'] = auth()->id();

        Blog::create($data);

        return redirect()->route('blogs.index')->with('success', 'Blog created successfully.');
    }

    public function show(Blog $blog)
    {
        return view('blogs.show', compact('blog'));
    }

    public function edit(Blog $blog)
    {
        $categories = Category::all();

        return view('blogs.edit', compact('blog', 'categories'));
    }

    public function update(UpdateBlogRequest $request, Blog $blog)
    {
        $data = $request->validated();

        if ($request->hasFile('blog_pic')) {
            if ($blog->blog_pic_url) {
                Storage::disk('public')->delete($blog->blog_pic_url);
            }
            $data['blog_pic_url'] = $request->file('blog_pic')->store('blogs', 'public');
        }

        if ($request->hasFile('author_avatar')) {
            if ($blog->author_avatar) {
                Storage::disk('public')->delete($blog->author_avatar);
            }
            $data['author_avatar'] = $request->file('author_avatar')->store('avatars', 'public');
        }

        if ($request->has('is_featured')) {
            $data['is_featured'] = $request->boolean('is_featured');
        }

        $blog->update($data);

        return redirect()->route('blogs.index')->with('success', 'Blog updated successfully.');
    }

    public function destroy(Blog $blog)
    {
        if ($blog->blog_pic_url) {
            Storage::disk('public')->delete($blog->blog_pic_url);
        }
        if ($blog->author_avatar) {
            Storage::disk('public')->delete($blog->author_avatar);
        }

        $blog->delete();

        return redirect()->route('blogs.index')->with('success', 'Blog deleted successfully.');
    }
}
