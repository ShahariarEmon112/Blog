<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BlogRequestController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CommentReportController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FriendRequestController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Models\Contact;
use App\Models\Message;
use App\Services\QuoteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/users/me', [AuthController::class, 'updateProfile']);
    Route::get('/blogs/mine', [BlogController::class, 'mine']);

    Route::post('/blog-requests', [BlogRequestController::class, 'store']);
    Route::get('/blog-requests/mine', [BlogRequestController::class, 'mine']);

    Route::post('/blogs/{blog}/comments', [CommentController::class, 'store']);
    Route::patch('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::post('/blogs/{blog}/like', [LikeController::class, 'store']);
    Route::delete('/blogs/{blog}/like', [LikeController::class, 'destroy']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{blog}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{blog}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{blog}', [FavoriteController::class, 'check']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'read']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::post('/comment-reports', [CommentReportController::class, 'store']);

    Route::post('/friend-requests', [FriendRequestController::class, 'send']);
    Route::patch('/friend-requests/{friendRequest}/accept', [FriendRequestController::class, 'accept']);
    Route::patch('/friend-requests/{friendRequest}/reject', [FriendRequestController::class, 'reject']);
    Route::get('/friend-requests/incoming', [FriendRequestController::class, 'incoming']);
    Route::get('/friend-requests/outgoing', [FriendRequestController::class, 'outgoing']);
    Route::get('/friends', [FriendRequestController::class, 'friends']);
    Route::get('/users/all', [FriendRequestController::class, 'users']);
    Route::delete('/friends/{user}', [FriendRequestController::class, 'remove']);

    Route::post('/messages', [MessageController::class, 'send']);
    Route::post('/messages/{message}/reply', [MessageController::class, 'reply']);
    Route::get('/messages/inbox', [MessageController::class, 'inbox']);
    Route::get('/messages/sent', [MessageController::class, 'sent']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/{message}', [MessageController::class, 'conversation']);
    Route::patch('/messages/{message}/read', [MessageController::class, 'markRead']);
    Route::get('/message-users', [MessageController::class, 'users']);
});

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/newsletter', [NewsletterController::class, 'store']);

Route::get('/favorites/count/{blog}', [FavoriteController::class, 'count']);

Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/featured', [BlogController::class, 'featured']);
Route::get('/blogs/popular', [BlogController::class, 'popular']);
Route::get('/blogs/category/{slug}', [BlogController::class, 'byCategory']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/site-settings', [SiteSettingController::class, 'show']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/blogs', [BlogController::class, 'adminIndex']);
    Route::post('/blogs', [BlogController::class, 'adminStore']);
    Route::put('/blogs/{blog}', [BlogController::class, 'adminUpdate']);
    Route::delete('/blogs/{blog}', [BlogController::class, 'adminDestroy']);
    Route::patch('/blogs/{blog}/featured', [BlogController::class, 'toggleFeatured']);

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/pending', [UserController::class, 'pending']);
    Route::post('/users/{user}/approve', [UserController::class, 'approve']);
    Route::patch('/users/{user}/ban', [UserController::class, 'ban']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::get('/blog-requests', [BlogRequestController::class, 'index']);
    Route::post('/blog-requests/{id}/approve', [BlogRequestController::class, 'approve']);
    Route::post('/blog-requests/{id}/reject', [BlogRequestController::class, 'reject']);
    Route::put('/blog-requests/{id}', [BlogRequestController::class, 'update']);
    Route::delete('/blog-requests/{id}', [BlogRequestController::class, 'destroy']);

    Route::apiResource('categories', CategoryController::class)->except('show');
    Route::get('/site-settings', [SiteSettingController::class, 'show']);
    Route::put('/site-settings', [SiteSettingController::class, 'update']);

    Route::get('/contact', [ContactController::class, 'index']);
    Route::patch('/contact/{id}/read', [ContactController::class, 'read']);
    Route::delete('/contact/{id}', [ContactController::class, 'destroy']);

    Route::get('/newsletter', [NewsletterController::class, 'index']);
    Route::delete('/newsletter/{id}', [NewsletterController::class, 'destroy']);

    Route::get('/comment-reports', [CommentReportController::class, 'index']);
    Route::patch('/comment-reports/{id}/status', [CommentReportController::class, 'updateStatus']);
    Route::delete('/comment-reports/{id}', [CommentReportController::class, 'destroy']);
    Route::delete('/comment-reports/{id}/comment', [CommentReportController::class, 'deleteComment']);

    // when admin replies to a contact form, create a message thread back to the user
    Route::post('/contact/{id}/reply', function (Request $request, int $id) {
        $contact = Contact::findOrFail($id);
        $validated = $request->validate(['body' => 'required|string']);
        if ($contact->user_id) {
            Message::create([
                'sender_id'   => $request->user()->id,
                'receiver_id' => $contact->user_id,
                'subject'     => 'Re: ' . ($contact->subject ?? 'Contact Message'),
                'body'        => $validated['body'],
            ]);
        }
        $contact->update(['replied' => true]);
        return response()->json(['message' => 'Reply sent']);
    });
});

Route::get('/quote', fn(QuoteService $s) => response()->json($s->quoteOfTheDay()));
