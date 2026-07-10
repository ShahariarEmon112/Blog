<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|min:3|max:50',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'status'   => 'pending',
            'is_super_user' => false,
        ]);

        return response()->json([
            'message' => 'Your account is awaiting admin approval.',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Your account is awaiting admin approval.',
            ], 403);
        }

        if ($user->status === 'banned') {
            return response()->json([
                'message' => 'Your account has been banned.',
            ], 403);
        }

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id', 'name', 'email', 'is_super_user', 'avatar', 'status']),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->only(['id', 'name', 'email', 'is_super_user', 'avatar', 'status'])
        );
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'   => 'sometimes|string|min:3|max:50',
            'avatar' => 'sometimes|file|image|max:2048',
            'author_details' => 'nullable|string|max:500',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        return response()->json($user->only(['id', 'name', 'email', 'is_super_user', 'avatar', 'status']));
    }
}
