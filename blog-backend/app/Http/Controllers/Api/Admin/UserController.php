<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::when($request->status, fn($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    public function pending()
    {
        return response()->json(
            User::where('status', 'pending')->latest()->get()
        );
    }

    public function approve(User $user)
    {
        $user->update(['status' => 'active']);

        return response()->json($user);
    }

    public function ban(User $user)
    {
        $newStatus = $user->status === 'banned' ? 'active' : 'banned';
        $user->update(['status' => $newStatus]);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->noContent();
    }
}
