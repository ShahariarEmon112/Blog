<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Blog;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Favorite::with('blog:id,title')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request, Blog $blog)
    {
        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('blog_id', $blog->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already favorited.'], 409);
        }

        Favorite::create([
            'user_id' => $request->user()->id,
            'blog_id' => $blog->id,
        ]);

        if ($blog->submitted_by && $blog->submitted_by !== $request->user()->id) {
            AppNotification::create([
                'recipient_id' => $blog->submitted_by,
                'action_by_id' => $request->user()->id,
                'blog_id'      => $blog->id,
                'type'         => 'favorite',
            ]);
        }

        return response()->json(['message' => 'Favorited.'], 201);
    }

    public function destroy(Request $request, Blog $blog)
    {
        $favorite = Favorite::where('user_id', $request->user()->id)
            ->where('blog_id', $blog->id)
            ->first();

        if (! $favorite) {
            return response()->json(['message' => 'Not favorited.'], 404);
        }

        $favorite->delete();

        return response()->noContent();
    }

    public function count(Blog $blog)
    {
        return response()->json([
            'count' => Favorite::where('blog_id', $blog->id)->count(),
        ]);
    }

    public function check(Request $request, Blog $blog)
    {
        $favorited = Favorite::where('user_id', $request->user()->id)
            ->where('blog_id', $blog->id)
            ->exists();

        return response()->json(['favorited' => $favorited]);
    }
}
