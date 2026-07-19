<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestMessagesSeeder extends Seeder
{
    public function run(): void
    {
        // Link existing contacts to user accounts by matching names
        foreach (Contact::all() as $contact) {
            $user = User::where('name', $contact->name)->first();
            if ($user) $contact->update(['user_id' => $user->id]);
        }

        $students = [14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];

        $threads = [
            [16, 17, 'Study Group Tomorrow', 'Hey, are we meeting for the study group tomorrow? I have some questions about the assignment.',
             [[17, 'Yeah, same time as usual. I\'ll bring my notes from the last class. See you there!']]],
            [18, 19, 'Blog Collaboration', 'I read your latest post. Really well written! Want to collaborate on a piece about student life?',
             [[19, 'Thanks! That sounds great. I have a few ideas already. Let me know when you\'re free.']]],
            [20, 21, 'Club Meeting', 'Don\'t forget the club meeting is at 3 PM today. We have a lot to discuss about the upcoming event.',
             [[21, 'Thanks for the reminder! I\'ll be there. I finished the budget draft you asked for.']]],
            [22, 23, 'Assignment Help', 'Hey, I\'m stuck on the math problem set. Can you help me out with question 5?',
             [[23, 'Sure! I just finished it. The key is to use the formula we learned in class. Want to meet at the library?']]],
            [24, 25, 'Weekend Plans', 'Any plans for the weekend? A few of us are thinking of going to that new cafe downtown.',
             [[25, 'I\'m in! I\'ve been wanting to check that place out. What time?']]],
            [26, 27, 'Book Recommendation', 'Just finished reading a great book on creative writing. Thought you might like it.',
             [[27, 'I\'ve heard great things about that one! Adding it to my list. Thanks!']]],
            [16, 18, 'Football This Weekend?', 'A few of us are playing football on Saturday morning. Want to join?',
             [[18, 'Count me in! I haven\'t played in a while. What time and where?']]],
            [14, 16, 'Welcome to the Platform', 'Hey Mahbubul! Welcome to ClassRoom Writes. Looking forward to seeing your posts.',
             [[16, 'Thanks Niyamul! Already working on my first blog post.']]],
        ];

        foreach ($threads as [$sender, $receiver, $subject, $body, $replies]) {
            $parent = Message::create([
                'sender_id'   => $sender,
                'receiver_id' => $receiver,
                'subject'     => $subject,
                'body'        => $body,
            ]);

            foreach ($replies as [$replySender, $replyBody]) {
                Message::create([
                    'sender_id'   => $replySender,
                    'receiver_id' => $replySender === $sender ? $receiver : $sender,
                    'subject'     => $subject,
                    'body'        => $replyBody,
                    'parent_id'   => $parent->id,
                ]);
            }
        }
    }
}
