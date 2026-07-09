@extends('layouts.admin')

@section('content')
    <h1 class="text-2xl font-bold mb-6">Dashboard — {{ ucfirst($section) }}</h1>

    @if ($section === 'overview')
        <div class="grid grid-cols-4 gap-4 mb-8">
            @foreach ($stats as $label => $value)
                <div class="p-4 bg-white rounded shadow">
                    <div class="text-gray-500 text-sm">{{ ucfirst($label) }}</div>
                    <div class="text-3xl font-bold">{{ $value }}</div>
                </div>
            @endforeach
        </div>

        <h2 class="text-xl font-semibold mb-4">Recent posts</h2>
        <ul class="space-y-2 mb-8">
            @forelse ($recentBlogs as $blog)
                <li class="p-3 bg-white rounded shadow">
                    {{ $blog->title }}
                    <span class="text-gray-400 text-sm ml-2">{{ $blog->created_at->diffForHumans() }}</span>
                </li>
            @empty
                <li class="text-gray-500">No blogs yet.</li>
            @endforelse
        </ul>

        <ul id="recent-live" class="mt-4 p-4 bg-white rounded shadow">Loading…</ul>
        <blockquote id="quote-widget" class="mt-4 p-4 bg-white rounded shadow border-l-4 border-indigo-500">
            Loading quote…
        </blockquote>
    @elseif ($section === 'blogs')
        @include('dashboard.blogs-panel')
    @elseif ($section === 'users')
        @include('dashboard.users-panel')
    @endif
@endsection
