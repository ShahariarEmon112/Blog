<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth'])->name('dashboard');

Route::get('/pending-approval', function () {
    return view('auth.pending-approval');
})->name('pending.approval');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'country:BD'])->group(function () {
    Route::get('/dashboard/{section}', function (string $section) {
        abort_unless(in_array($section, ['overview', 'blogs', 'users']), 404);
        return "section: {$section}";
    })->name('dashboard.section');

    Route::redirect('/dashboard', '/dashboard/overview');
});

require __DIR__.'/auth.php';
