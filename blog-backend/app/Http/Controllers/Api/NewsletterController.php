<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NewsletterController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:newsletter_subscribers,email',
        ]);

        $subscriber = NewsletterSubscriber::create($validated);

        Log::info('Newsletter signup', ['email' => $subscriber->email]);

        return response()->json($subscriber, 201);
    }

    public function index()
    {
        return response()->json(NewsletterSubscriber::latest()->paginate(20));
    }

    public function destroy(int $id)
    {
        NewsletterSubscriber::findOrFail($id)->delete();

        return response()->noContent();
    }
}
