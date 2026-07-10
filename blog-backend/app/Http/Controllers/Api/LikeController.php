<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Blog;
use App\Models\Like;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function store(Request $request, Blog $blog)
    {
        $existing = Like::where('user_id', $request->user()->id)
            ->where('blog_id', $blog->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already liked.'], 409);
        }

        Like::create([
            'user_id' => $request->user()->id,
            'blog_id' => $blog->id,
        ]);

        $blog->increment('likes_count');

        if ($blog->submitted_by && $blog->submitted_by !== $request->user()->id) {
            AppNotification::create([
                'recipient_id' => $blog->submitted_by,
                'action_by_id' => $request->user()->id,
                'blog_id'      => $blog->id,
                'type'         => 'like',
            ]);
        }

        return response()->json(['message' => 'Liked.'], 201);
    }

    public function destroy(Request $request, Blog $blog)
    {
        $like = Like::where('user_id', $request->user()->id)
            ->where('blog_id', $blog->id)
            ->first();

        if (! $like) {
            return response()->json(['message' => 'Not liked yet.'], 404);
        }

        $like->delete();
        $blog->decrement('likes_count');

        return response()->noContent();
    }
}
