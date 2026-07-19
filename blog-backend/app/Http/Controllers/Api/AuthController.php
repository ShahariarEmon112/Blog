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

        // new accounts start as pending - admin must approve
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
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        // let users login with either email or user id
        $field = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'id';
        $user  = User::where($field, $request->login)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        // don't let pending accounts in (teacher's requirement)
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
            'user'  => $user->only(['id', 'name', 'email', 'is_super_user', 'avatar', 'status', 'age', 'gmail', 'education_status']),
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
            $request->user()->only(['id', 'name', 'email', 'is_super_user', 'avatar', 'status', 'age', 'gmail', 'education_status'])
        );
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'              => 'sometimes|string|min:3|max:50',
            'avatar'            => 'sometimes|file|image|max:2048',
            'author_details'    => 'nullable|string|max:500',
            'age'               => 'nullable|integer|min:1|max:150',
            'gmail'             => 'nullable|email|max:255',
            'education_status'  => 'nullable|string|max:255',
        ]);

        // avatar gets stored in storage/app/public/avatars
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        return response()->json($user->only(['id', 'name', 'email', 'is_super_user', 'avatar', 'status', 'age', 'gmail', 'education_status']));
    }
}
