<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">{{ $blog->title }}</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                @if ($blog->blog_pic_url)
                    <img src="{{ Storage::url($blog->blog_pic_url) }}" alt="{{ $blog->title }}" class="w-full h-64 object-cover rounded mb-6">
                @endif

                <div class="flex items-center gap-4 mb-6 text-sm text-gray-500">
                    <span>By {{ $blog->author_name }}</span>
                    <span>{{ $blog->category?->name ?? 'Uncategorized' }}</span>
                    <span>{{ $blog->time_read }}</span>
                    @if ($blog->publish_date)
                        <span>{{ $blog->publish_date->format('M d, Y') }}</span>
                    @endif
                </div>

                <div class="prose max-w-none mb-8">
                    {!! nl2br(e($blog->content)) !!}
                </div>

                <a href="{{ route('blogs.index') }}" class="text-indigo-600 hover:underline">&larr; Back to blogs</a>
            </div>
        </div>
    </div>
</x-app-layout>
