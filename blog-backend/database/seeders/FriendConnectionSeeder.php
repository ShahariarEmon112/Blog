<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\FriendRequest;
use Illuminate\Database\Seeder;

class FriendConnectionSeeder extends Seeder
{
    public function run(): void
    {
        $students = [14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];

        foreach ([14, 16, 17, 18] as $sid) {
            FriendRequest::create(['sender_id' => 1, 'receiver_id' => $sid, 'status' => 'accepted']);
        }

        for ($i = 0; $i < count($students) - 1; $i++) {
            FriendRequest::create([
                'sender_id' => $students[$i],
                'receiver_id' => $students[$i + 1],
                'status' => 'accepted',
            ]);
        }

        $extraPairs = [[14, 18], [16, 20], [17, 22], [19, 25], [21, 27], [23, 26], [24, 29], [28, 17]];
        foreach ($extraPairs as [$a, $b]) {
            FriendRequest::create(['sender_id' => $a, 'receiver_id' => $b, 'status' => 'accepted']);
        }

        $pendingRequests = [[14, 30], [16, 31], [18, 32], [20, 33]];
        foreach ($pendingRequests as [$sender, $receiver]) {
            $fr = FriendRequest::create(['sender_id' => $sender, 'receiver_id' => $receiver, 'status' => 'pending']);
            AppNotification::create([
                'recipient_id'      => $receiver,
                'action_by_id'      => $sender,
                'friend_request_id' => $fr->id,
                'type'              => 'friend_request',
            ]);
        }
    }
}
