<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Services\QuoteService;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/blogs/mine', [BlogController::class, 'mine']);
});

Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/featured', [BlogController::class, 'featured']);
Route::get('/blogs/popular', [BlogController::class, 'popular']);
Route::get('/blogs/category/{slug}', [BlogController::class, 'byCategory']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
    Route::get('/users/pending', [\App\Http\Controllers\Api\Admin\UserController::class, 'pending']);
    Route::post('/users/{user}/approve', [\App\Http\Controllers\Api\Admin\UserController::class, 'approve']);
    Route::patch('/users/{user}/ban', [\App\Http\Controllers\Api\Admin\UserController::class, 'ban']);
    Route::delete('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);
});

Route::get('/quote', fn(QuoteService $s) => response()->json($s->quoteOfTheDay()));
