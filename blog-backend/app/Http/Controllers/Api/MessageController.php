<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FriendRequest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject'     => 'required|string|max:255',
            'body'        => 'required|string',
        ]);

        $validated['sender_id'] = $request->user()->id;

        $message = Message::create($validated);
        $message->load(['sender:id,name,avatar', 'receiver:id,name,avatar']);

        return response()->json($message, 201);
    }

    public function reply(Request $request, Message $message)
    {
        if ($message->receiver_id !== $request->user()->id && $message->sender_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => 'required|string',
        ]);

        $reply = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $message->sender_id === $request->user()->id ? $message->receiver_id : $message->sender_id,
            'subject'     => $message->subject,
            'body'        => $validated['body'],
            'parent_id'   => $message->id,
        ]);

        $reply->load(['sender:id,name,avatar', 'receiver:id,name,avatar']);

        $message->update(['read' => true]);

        return response()->json($reply, 201);
    }

    public function inbox(Request $request)
    {
        return response()->json(
            Message::with(['sender:id,name,avatar'])
                ->where('receiver_id', $request->user()->id)
                ->whereNull('parent_id')
                ->latest()
                ->get()
        );
    }

    public function sent(Request $request)
    {
        return response()->json(
            Message::with(['receiver:id,name,avatar'])
                ->where('sender_id', $request->user()->id)
                ->whereNull('parent_id')
                ->latest()
                ->get()
        );
    }

    public function conversation(Request $request, Message $message)
    {
        if ($message->receiver_id !== $request->user()->id && $message->sender_id !== $request->user()->id) {
            abort(403);
        }

        $thread = Message::with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
            ->where(function ($q) use ($message) {
                $q->where('id', $message->id)
                  ->orWhere('parent_id', $message->id);
            })
            ->orderBy('created_at')
            ->get();

        if ($message->receiver_id === $request->user()->id) {
            $message->update(['read' => true]);
        }

        return response()->json($thread);
    }

    public function markRead(Request $request, Message $message)
    {
        if ($message->receiver_id !== $request->user()->id) {
            abort(403);
        }

        $message->update(['read' => true]);

        return response()->json($message);
    }

    public function unreadCount(Request $request)
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->where('read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    public function users(Request $request)
    {
        $friendIds = collect();
        FriendRequest::where(function ($q) use ($request) {
            $q->where('sender_id', $request->user()->id)
              ->orWhere('receiver_id', $request->user()->id);
        })->where('status', 'accepted')->each(function ($fr) use ($friendIds, $request) {
            $friendIds->push($fr->sender_id === $request->user()->id ? $fr->receiver_id : $fr->sender_id);
        });

        return response()->json(
            User::where('id', '!=', $request->user()->id)
                ->where('status', 'active')
                ->get(['id', 'name', 'avatar'])
                ->map(fn($u) => [
                    'id'        => $u->id,
                    'name'      => $u->name,
                    'avatar'    => $u->avatar,
                    'is_friend' => $friendIds->contains($u->id),
                ])
                ->sortByDesc('is_friend')
                ->values()
        );
    }
}
