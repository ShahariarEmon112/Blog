<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Blog;
use App\Models\BlogRequest;
use App\Models\FriendRequest;
use Illuminate\Http\Request;

class BlogRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'author_name' => 'required|string|max:255',
            'author_avatar' => 'nullable|string',
            'author_details' => 'nullable|string|max:500',
            'time_read'   => 'nullable|string|max:32',
            'blog_image'  => 'nullable|image|max:5120',
        ]);

        $validated['submitted_by'] = $request->user()->id;

        if ($request->hasFile('blog_image')) {
            $validated['blog_image'] = $request->file('blog_image')->store('blog-requests', 'public');
        }

        $blogRequest = BlogRequest::create($validated);

        return response()->json($blogRequest, 201);
    }

    public function mine(Request $request)
    {
        return response()->json(
            BlogRequest::with('category')
                ->where('submitted_by', $request->user()->id)
                ->latest()
                ->get()
        );
    }

    public function index()
    {
        return response()->json(
            BlogRequest::with(['user:id,name,email', 'category'])->latest()->paginate(20)
        );
    }

    public function approve(int $id)
    {
        $blogRequest = BlogRequest::findOrFail($id);

        $blog = Blog::create([
            'title'        => $blogRequest->title,
            'content'      => $blogRequest->content,
            'category_id'  => $blogRequest->category_id,
            'submitted_by' => $blogRequest->submitted_by,
            'author_name'  => $blogRequest->author_name,
            'author_avatar' => $blogRequest->author_avatar,
            'author_details' => $blogRequest->author_details,
            'blog_pic_url' => $blogRequest->blog_image,
            'time_read'    => $blogRequest->time_read ?? '3 mins read',
        ]);

        $blogRequest->update(['status' => 'approved']);

        AppNotification::create([
            'recipient_id'  => $blogRequest->submitted_by,
            'action_by_id'  => auth()->id(),
            'blog_id'       => $blog->id,
            'type'          => 'request_approved',
        ]);

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

        return response()->json(['blog_id' => $blog->id, 'message' => 'Blog request approved.']);
    }

    public function reject(Request $request, int $id)
    {
        $request->validate(['admin_note' => 'nullable|string|max:1000']);

        $blogRequest = BlogRequest::findOrFail($id);
        $blogRequest->update([
            'status'    => 'rejected',
            'admin_note' => $request->admin_note,
        ]);

        return response()->json($blogRequest);
    }

    public function update(Request $request, int $id)
    {
        $blogRequest = BlogRequest::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'content'     => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'time_read'   => 'nullable|string|max:32',
        ]);

        $blogRequest->update($validated);

        return response()->json($blogRequest);
    }

    public function destroy(int $id)
    {
        BlogRequest::findOrFail($id)->delete();

        return response()->noContent();
    }
}
