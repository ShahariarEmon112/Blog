<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = AppNotification::with(['actionBy:id,name,avatar', 'blog:id,title'])
            ->where('recipient_id', $request->user()->id)
            ->latest()
            ->take(50)
            ->get();

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
