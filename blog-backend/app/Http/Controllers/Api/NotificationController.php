<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = AppNotification::with(['actionBy:id,name,avatar', 'blog:id,title', 'friendRequest'])
            ->where('recipient_id', $request->user()->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(fn($n) => [
                'id'             => $n->id,
                'type'           => $n->type,
                'read'           => $n->read,
                'created_at'     => $n->created_at->toISOString(),
                'action_by'      => $n->actionBy ? ['id' => $n->actionBy->id, 'name' => $n->actionBy->name, 'avatar' => $n->actionBy->avatar] : null,
                'blog'           => $n->blog ? ['id' => $n->blog->id, 'title' => $n->blog->title] : null,
                'friend_request' => $n->friendRequest ? ['id' => $n->friendRequest->id, 'status' => $n->friendRequest->status] : null,
                'message'        => match ($n->type) {
                    'like'             => ($n->actionBy->name ?? 'Someone') . ' liked your blog "' . ($n->blog->title ?? '') . '"',
                    'comment'          => ($n->actionBy->name ?? 'Someone') . ' commented on your blog "' . ($n->blog->title ?? '') . '"',
                    'favorite'         => ($n->actionBy->name ?? 'Someone') . ' favorited your blog "' . ($n->blog->title ?? '') . '"',
                    'request_approved' => 'Your blog request "' . ($n->blog->title ?? '') . '" has been approved',
                    'welcome'          => 'Welcome to ClassRoom Writes!',
                    'blog_posted'      => ($n->actionBy->name ?? 'Your friend') . ' posted a new blog "' . ($n->blog->title ?? '') . '"',
                    'friend_request'   => ($n->actionBy->name ?? 'Someone') . ' sent you a friend request',
                    'friend_accepted'  => ($n->actionBy->name ?? 'Someone') . ' accepted your friend request',
                    default            => 'You have a new notification',
                },
            ]);

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $count = AppNotification::where('recipient_id', $request->user()->id)
            ->where('read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    public function read(Request $request, int $id)
    {
        $notification = AppNotification::where('recipient_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['read' => true]);

        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        AppNotification::where('recipient_id', $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function destroy(Request $request, int $id)
    {
        $notification = AppNotification::where('recipient_id', $request->user()->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->noContent();
    }
}
