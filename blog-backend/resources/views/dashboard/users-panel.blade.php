<div class="bg-white rounded shadow p-6">
    <h2 class="text-xl font-semibold mb-4">Pending Users</h2>

    @php
        $pendingUsers = \App\Models\User::where('status', 'pending')->latest()->get();
    @endphp

    @if ($pendingUsers->count())
        <ul class="space-y-2">
            @foreach ($pendingUsers as $user)
                <li class="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>{{ $user->name }} — <span class="text-gray-500">{{ $user->email }}</span></span>
                    <span class="text-sm text-yellow-600">Pending</span>
                </li>
            @endforeach
        </ul>
    @else
        <p class="text-gray-500">No pending users.</p>
    @endif
</div>
