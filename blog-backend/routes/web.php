<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/pending-approval', function () {
    return view('auth.pending-approval');
})->name('pending.approval');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('blogs', BlogController::class);
});

Route::middleware(['auth', 'country:BD'])->group(function () {
    Route::get('/dashboard/{section}', [DashboardController::class, 'show'])
        ->name('dashboard.section');

    Route::get('/dashboard/latest-blogs.json', function () {
        return response()->json([
            'blogs' => \App\Models\Blog::latest()->take(5)->get(['id', 'title', 'created_at']),
        ]);
    })->name('dashboard.latest');

    Route::redirect('/dashboard', '/dashboard/overview')->name('dashboard');
});

require __DIR__.'/auth.php';
