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

    Route::post('/blog-requests', [\App\Http\Controllers\Api\BlogRequestController::class, 'store']);
    Route::get('/blog-requests/mine', [\App\Http\Controllers\Api\BlogRequestController::class, 'mine']);

    Route::post('/blogs/{blog}/comments', [\App\Http\Controllers\Api\CommentController::class, 'store']);
    Route::patch('/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'destroy']);

    Route::post('/blogs/{blog}/like', [\App\Http\Controllers\Api\LikeController::class, 'store']);
    Route::delete('/blogs/{blog}/like', [\App\Http\Controllers\Api\LikeController::class, 'destroy']);

    Route::get('/favorites', [\App\Http\Controllers\Api\FavoriteController::class, 'index']);
    Route::post('/favorites/{blog}', [\App\Http\Controllers\Api\FavoriteController::class, 'store']);
    Route::delete('/favorites/{blog}', [\App\Http\Controllers\Api\FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{blog}', [\App\Http\Controllers\Api\FavoriteController::class, 'check']);

    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'read']);
    Route::patch('/notifications/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);

    Route::post('/comment-reports', [\App\Http\Controllers\Api\CommentReportController::class, 'store']);
});

Route::post('/contact', [\App\Http\Controllers\Api\ContactController::class, 'store']);
Route::post('/newsletter', [\App\Http\Controllers\Api\NewsletterController::class, 'store']);

Route::get('/favorites/count/{blog}', [\App\Http\Controllers\Api\FavoriteController::class, 'count']);

Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/featured', [BlogController::class, 'featured']);
Route::get('/blogs/popular', [BlogController::class, 'popular']);
Route::get('/blogs/category/{slug}', [BlogController::class, 'byCategory']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);

Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
    Route::get('/users/pending', [\App\Http\Controllers\Api\Admin\UserController::class, 'pending']);
    Route::post('/users/{user}/approve', [\App\Http\Controllers\Api\Admin\UserController::class, 'approve']);
    Route::patch('/users/{user}/ban', [\App\Http\Controllers\Api\Admin\UserController::class, 'ban']);
    Route::delete('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);

    Route::get('/blog-requests', [\App\Http\Controllers\Api\BlogRequestController::class, 'index']);
    Route::post('/blog-requests/{id}/approve', [\App\Http\Controllers\Api\BlogRequestController::class, 'approve']);
    Route::post('/blog-requests/{id}/reject', [\App\Http\Controllers\Api\BlogRequestController::class, 'reject']);
    Route::put('/blog-requests/{id}', [\App\Http\Controllers\Api\BlogRequestController::class, 'update']);
    Route::delete('/blog-requests/{id}', [\App\Http\Controllers\Api\BlogRequestController::class, 'destroy']);

    Route::apiResource('categories', \App\Http\Controllers\Api\CategoryController::class)->except('show');
    Route::get('/site-settings', [\App\Http\Controllers\Api\SiteSettingController::class, 'show']);
    Route::put('/site-settings', [\App\Http\Controllers\Api\SiteSettingController::class, 'update']);

    Route::get('/contact', [\App\Http\Controllers\Api\ContactController::class, 'index']);
    Route::patch('/contact/{id}/read', [\App\Http\Controllers\Api\ContactController::class, 'read']);
    Route::delete('/contact/{id}', [\App\Http\Controllers\Api\ContactController::class, 'destroy']);

    Route::get('/newsletter', [\App\Http\Controllers\Api\NewsletterController::class, 'index']);
    Route::delete('/newsletter/{id}', [\App\Http\Controllers\Api\NewsletterController::class, 'destroy']);

    Route::get('/comment-reports', [\App\Http\Controllers\Api\CommentReportController::class, 'index']);
    Route::patch('/comment-reports/{id}/status', [\App\Http\Controllers\Api\CommentReportController::class, 'updateStatus']);
    Route::delete('/comment-reports/{id}', [\App\Http\Controllers\Api\CommentReportController::class, 'destroy']);
    Route::delete('/comment-reports/{id}/comment', [\App\Http\Controllers\Api\CommentReportController::class, 'deleteComment']);
});

Route::get('/quote', fn(QuoteService $s) => response()->json($s->quoteOfTheDay()));
