<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Http\Resources\BlogResource;
use App\Models\AppNotification;
use App\Models\Blog;
use App\Models\Category;
use App\Models\FriendRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function adminIndex(Request $request)
    {
        $search = $request->search;

        return BlogResource::collection(
            Blog::with('category')
                ->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))
                ->latest()
                ->paginate(50)
        );
    }

    public function adminStore(StoreBlogRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('blog_pic')) {
            $data['blog_pic_url'] = $request->file('blog_pic')->store('blogs', 'public');
        }
        if ($request->hasFile('author_avatar')) {
            $data['author_avatar'] = $request->file('author_avatar')->store('avatars', 'public');
        }

        $data['submitted_by'] = $request->user()->id;

        $blog = Blog::create($data);

        $this->notifyFriends($blog);

        return new BlogResource($blog);
    }

    public function adminUpdate(UpdateBlogRequest $request, Blog $blog)
    {
        $data = $request->validated();

        if ($request->hasFile('blog_pic')) {
            if ($blog->blog_pic_url) Storage::disk('public')->delete($blog->blog_pic_url);
            $data['blog_pic_url'] = $request->file('blog_pic')->store('blogs', 'public');
        }
        if ($request->hasFile('author_avatar')) {
            if ($blog->author_avatar) Storage::disk('public')->delete($blog->author_avatar);
            $data['author_avatar'] = $request->file('author_avatar')->store('avatars', 'public');
        }

        $blog->update($data);

        return new BlogResource($blog->fresh());
    }

    public function adminDestroy(Blog $blog)
    {
        if ($blog->blog_pic_url) Storage::disk('public')->delete($blog->blog_pic_url);
        if ($blog->author_avatar) Storage::disk('public')->delete($blog->author_avatar);

        $blog->delete();

        return response()->noContent();
    }

    public function toggleFeatured(Blog $blog)
    {
        $blog->update(['is_featured' => !$blog->is_featured]);

        return new BlogResource($blog->fresh());
    }

    private function notifyFriends(Blog $blog): void
    {
        $friendIds = collect();
        FriendRequest::where(function ($q) use ($blog) {
            $q->where('sender_id', $blog->submitted_by)
              ->orWhere('receiver_id', $blog->submitted_by);
        })->where('status', 'accepted')->each(function ($fr) use ($friendIds, $blog) {
            $friendIds->push($fr->sender_id === $blog->submitted_by ? $fr->receiver_id : $fr->sender_id);
        });

        foreach ($friendIds->unique() as $fid) {
            AppNotification::create([
                'recipient_id' => $fid,
                'action_by_id' => $blog->submitted_by,
                'blog_id'      => $blog->id,
                'type'         => 'blog_posted',
            ]);
        }
    }
}
