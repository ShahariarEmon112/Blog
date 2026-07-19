<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Http\Request;

class FriendRequestController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id|different:sender_id',
        ]);

        // check both directions - maybe they already sent us one
        $existing = FriendRequest::where(function ($q) use ($request, $validated) {
            $q->where('sender_id', $request->user()->id)
              ->where('receiver_id', $validated['receiver_id']);
        })->orWhere(function ($q) use ($request, $validated) {
            $q->where('sender_id', $validated['receiver_id'])
              ->where('receiver_id', $request->user()->id);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Friend request already exists.'], 409);
        }

        $fr = FriendRequest::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'status'      => 'pending',
        ]);

        AppNotification::create([
            'recipient_id' => $validated['receiver_id'],
            'action_by_id' => $request->user()->id,
            'type'         => 'friend_request',
            'friend_request_id' => $fr->id,
        ]);

        $fr->load('sender');
        return response()->json($fr, 201);
    }

    public function accept(Request $request, FriendRequest $friendRequest)
    {
        if ($friendRequest->receiver_id !== $request->user()->id) {
            abort(403);
        }

        $friendRequest->update(['status' => 'accepted']);

        AppNotification::create([
            'recipient_id' => $friendRequest->sender_id,
            'action_by_id' => $request->user()->id,
            'type'         => 'friend_accepted',
            'friend_request_id' => $friendRequest->id,
        ]);

        return response()->json($friendRequest);
    }

    public function reject(Request $request, FriendRequest $friendRequest)
    {
        if ($friendRequest->receiver_id !== $request->user()->id) {
            abort(403);
        }

        $friendRequest->update(['status' => 'rejected']);

        return response()->json($friendRequest);
    }

    public function incoming(Request $request)
    {
        return response()->json(
            FriendRequest::with('sender')
                ->where('receiver_id', $request->user()->id)
                ->where('status', 'pending')
                ->latest()
                ->get()
        );
    }

    public function outgoing(Request $request)
    {
        return response()->json(
            FriendRequest::with('receiver')
                ->where('sender_id', $request->user()->id)
                ->where('status', 'pending')
                ->latest()
                ->get()
        );
    }

    // friendship is bidirectional - merge sent + received accepted requests
    public function friends(Request $request)
    {
        $sent = FriendRequest::with('receiver')
            ->where('sender_id', $request->user()->id)
            ->where('status', 'accepted')
            ->get()
            ->pluck('receiver');

        $received = FriendRequest::with('sender')
            ->where('receiver_id', $request->user()->id)
            ->where('status', 'accepted')
            ->get()
            ->pluck('sender');

        return response()->json($sent->merge($received)->unique('id')->values());
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

        $pendingIds = collect();
        FriendRequest::where(function ($q) use ($request) {
            $q->where('sender_id', $request->user()->id)
              ->orWhere('receiver_id', $request->user()->id);
        })->where('status', 'pending')->each(function ($fr) use ($pendingIds, $request) {
            $pendingIds->push($fr->sender_id === $request->user()->id ? $fr->receiver_id : $fr->sender_id);
        });

        $allUsers = User::where('id', '!=', $request->user()->id)
            ->where('status', 'active')
            ->get()
            ->map(fn($u) => [
                'id'        => $u->id,
                'name'      => $u->name,
                'avatar'    => $u->avatar,
                'is_friend' => $friendIds->contains($u->id),
                'has_pending_request' => $pendingIds->contains($u->id),
            ]);

        return response()->json($allUsers);
    }

    public function remove(Request $request, User $user)
    {
        FriendRequest::where(function ($q) use ($request, $user) {
            $q->where('sender_id', $request->user()->id)
              ->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($request, $user) {
            $q->where('sender_id', $user->id)
              ->where('receiver_id', $request->user()->id);
        })->where('status', 'accepted')->delete();

        return response()->noContent();
    }
}
