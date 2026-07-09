<nav class="w-64 min-h-screen bg-white shadow-md p-4">
    <h2 class="text-lg font-semibold mb-4">Dashboard</h2>
    <ul class="space-y-2">
        @foreach (['overview', 'blogs', 'users'] as $item)
            <li>
                <a href="{{ route('dashboard.section', $item) }}"
                   class="block px-4 py-2 rounded {{ request()->route('section') === $item ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100' }}">
                    {{ ucfirst($item) }}
                </a>
            </li>
        @endforeach
    </ul>
</nav>
