<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Blogs</h2>
            <a href="{{ route('blogs.create') }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500">
                Create Blog
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if (session('success'))
                <div class="mb-4 px-4 py-2 bg-green-100 border border-green-400 text-green-700 rounded">
                    {{ session('success') }}
                </div>
            @endif

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b text-left">
                                <th class="pb-3 pr-4">Title</th>
                                <th class="pb-3 pr-4">Category</th>
                                <th class="pb-3 pr-4">Author</th>
                                <th class="pb-3 pr-4">Featured</th>
                                <th class="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($blogs as $blog)
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="py-3 pr-4">{{ $blog->title }}</td>
                                    <td class="py-3 pr-4">{{ $blog->category?->name ?? '—' }}</td>
                                    <td class="py-3 pr-4">{{ $blog->author_name }}</td>
                                    <td class="py-3 pr-4">{{ $blog->is_featured ? 'Yes' : 'No' }}</td>
                                    <td class="py-3 flex gap-2">
                                        <a href="{{ route('blogs.show', $blog) }}" class="text-indigo-600 hover:underline">View</a>
                                        <a href="{{ route('blogs.edit', $blog) }}" class="text-yellow-600 hover:underline">Edit</a>
                                        <form action="{{ route('blogs.destroy', $blog) }}" method="POST" onsubmit="return confirm('Delete this blog?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-red-600 hover:underline">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>

                    <div class="mt-6">
                        {{ $blogs->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
