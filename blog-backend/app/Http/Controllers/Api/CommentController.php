<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Blog;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'text'      => 'required|string|max:10000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'text'      => $validated['text'],
            'user_id'   => $request->user()->id,
            'blog_id'   => $blog->id,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        // Notify blog owner (skip if actor is owner)
        if ($blog->submitted_by && $blog->submitted_by !== $request->user()->id) {
            AppNotification::create([
                'recipient_id' => $blog->submitted_by,
                'action_by_id' => $request->user()->id,
                'blog_id'      => $blog->id,
                'comment_id'   => $comment->id,
                'type'         => 'comment',
            ]);
        }

        // Notify parent comment author if this is a reply
        if ($comment->parent_id) {
            $parent = Comment::find($comment->parent_id);
            if ($parent && $parent->user_id !== $request->user()->id) {
                AppNotification::firstOrCreate([
                    'recipient_id' => $parent->user_id,
                    'action_by_id' => $request->user()->id,
                    'blog_id'      => $blog->id,
                    'comment_id'   => $comment->id,
                    'type'         => 'comment',
                ]);
            }
        }

        $comment->load('user');

        return response()->json($comment, 201);
    }

    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            abort(403, 'You can only edit your own comments.');
        }

        $validated = $request->validate(['text' => 'required|string|max:10000']);
        $comment->update($validated);

        return response()->json($comment);
    }

    public function destroy(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            abort(403, 'You can only delete your own comments.');
        }

        $comment->delete();

        return response()->noContent();
    }
}
