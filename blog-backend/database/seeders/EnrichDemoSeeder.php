<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\Favorite;
use App\Models\Like;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class EnrichDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('is_super_user', true)->first();
        $students = User::whereIn('email', [
            'mahbubul002@gmail.com', 'rafsan003@gmail.com', 'shahriar005@gmail.com',
            'rafsan006@gmail.com', 'fahim007@gmail.com', 'mehedi012@gmail.com',
            'redoanul014@gmail.com', 'alif016@gmail.com', 'sazzath019@gmail.com',
            'shah089@gmail.com', 'rahi088@gmail.com', 'lionel122@gmail.com',
            'neymar123@gmail.com', 'cristiano124@gmail.com'
        ])->get();
        $factoryUsers = User::where('status', 'active')->whereNotIn('email', $students->pluck('email'))->get();
        $allActive = $students->merge($factoryUsers);

        // 1. Update admin profile
        $admin->update([
            'name'              => 'MD. Shahariar Emon Saikat',
            'avatar'            => 'https://ui-avatars.com/api/?name=MD.+Shahariar+Emon+Saikat&background=random&color=fff&size=128&bold=true',
            'author_details'    => 'Founder & Administrator of ClassRoom Writes. Passionate about creating a platform for student writers.',
            'age'               => 24,
            'gmail'             => 'admin.classroomwrites@gmail.com',
            'education_status'  => 'Computer Science & Engineering',
        ]);

        // 2. Update student profiles with author_details, age, gmail, education_status
        $studentProfiles = [
            ['email' => 'mahbubul002@gmail.com',  'details' => 'Creative writer and tech enthusiast.',                                'age' => 22, 'gmail' => 'mahbubul.alam@gmail.com',          'edu' => 'CSE'],
            ['email' => 'rafsan003@gmail.com',     'details' => 'Love writing about science and philosophy.',                          'age' => 21, 'gmail' => 'rafsan.jani@gmail.com',            'edu' => 'EEE'],
            ['email' => 'shahriar005@gmail.com',   'details' => 'Aspiring journalist and content creator.',                           'age' => 23, 'gmail' => 'shahriar.prottoy@gmail.com',       'edu' => 'BBA'],
            ['email' => 'rafsan006@gmail.com',     'details' => 'Poet and short story writer.',                                       'age' => 22, 'gmail' => 'rafsan.riasat@gmail.com',          'edu' => 'English'],
            ['email' => 'fahim007@gmail.com',      'details' => 'Tech blogger and open source contributor.',                          'age' => 21, 'gmail' => 'fahim.hossen@gmail.com',           'edu' => 'CSE'],
            ['email' => 'mehedi012@gmail.com',     'details' => 'Writing about productivity and student life.',                       'age' => 22, 'gmail' => 'mehedi.nibir@gmail.com',           'edu' => 'Pharmacy'],
            ['email' => 'redoanul014@gmail.com',   'details' => 'Entrepreneur and motivational writer.',                              'age' => 23, 'gmail' => 'redoanul.karim@gmail.com',         'edu' => 'BBA'],
            ['email' => 'alif016@gmail.com',       'details' => 'Love exploring history and sharing stories.',                        'age' => 21, 'gmail' => 'alif.ahad@gmail.com',              'edu' => 'History'],
            ['email' => 'sazzath019@gmail.com',    'details' => 'Photographer and travel blogger.',                                   'age' => 22, 'gmail' => 'sazzath.rafee@gmail.com',          'edu' => 'CSE'],
            ['email' => 'shah089@gmail.com',       'details' => 'Debater and opinion writer.',                                       'age' => 23, 'gmail' => 'shah.makhdum@gmail.com',           'edu' => 'Political Science'],
            ['email' => 'rahi088@gmail.com',       'details' => 'Book reviewer and creative writing enthusiast.',                     'age' => 22, 'gmail' => 'rahi.sadat@gmail.com',             'edu' => 'English'],
            ['email' => 'lionel122@gmail.com',     'details' => 'Sports blogger and fitness advocate.',                               'age' => 24, 'gmail' => 'lionel.messi@gmail.com',           'edu' => 'Physical Education'],
            ['email' => 'neymar123@gmail.com',     'details' => 'Music lover and lifestyle blogger.',                                 'age' => 23, 'gmail' => 'neymar.jr@gmail.com',              'edu' => 'Music'],
            ['email' => 'cristiano124@gmail.com',  'details' => 'Fitness coach and health writer.',                                   'age' => 24, 'gmail' => 'cristiano.ronaldo@gmail.com',      'edu' => 'Sports Science'],
        ];
        foreach ($studentProfiles as $p) {
            User::where('email', $p['email'])->update([
                'author_details'   => $p['details'],
                'age'              => $p['age'],
                'gmail'            => $p['gmail'],
                'education_status' => $p['edu'],
            ]);
        }

        $this->command->info('Updated user profiles');

        // 3. More messages between different user pairs
        $conversations = [
            ['Mahbubul Alam', 'Rafsan Jani', 'Library Timings', 'Hey, what time does the library close today?'],
            ['Mahbubul Alam', 'Rafsan Jani', 'Library Timings', 'It closes at 8 PM. Want to study together after class?'],
            ['Rafsan Jani', 'Shahriar Prottoy', 'Group Project', 'We need to finalize the group project topic by Friday.'],
            ['Rafsan Jani', 'Shahriar Prottoy', 'Group Project', 'I have a few ideas. Let me share them in tomorrow meet.'],
            ['Fahim Hossen', 'Alif Al Ahad', 'Coding Help', 'Can you help me debug this PHP code? I am stuck on the loop.'],
            ['Fahim Hossen', 'Alif Al Ahad', 'Coding Help', 'Sure! Send me the code snippet. I will take a look.'],
            ['Mehedi Nibir', 'Sazzath Rafee', 'Seminar Event', 'Are you going to the seminar on AI next week?'],
            ['Mehedi Nibir', 'Sazzath Rafee', 'Seminar Event', 'Yes, I already registered! The speaker is amazing.'],
            ['Shah Makhdum Sharif', 'Rahi Sadat Ruhan', 'Photo Exhibition', 'My photos are being displayed at the exhibition this weekend!'],
            ['Shah Makhdum Sharif', 'Rahi Sadat Ruhan', 'Photo Exhibition', 'Congratulations! I will definitely come and support.'],
            ['MD. Shahariar Emon Saikat', 'Mahbubul Alam', 'Welcome to the Platform!', 'Welcome aboard! We are excited to have you as a writer.'],
            ['MD. Shahariar Emon Saikat', 'Mahbubul Alam', 'Re: Welcome to the Platform!', 'Thank you! I am excited to start publishing my articles.'],
        ];

        foreach ($conversations as $i => [$senderName, $receiverName, $subject, $body]) {
            $sender = User::where('name', $senderName)->first();
            $receiver = User::where('name', $receiverName)->first();
            if (!$sender || !$receiver) continue;
            $parentId = ($i % 2 === 1)
                ? Message::where('subject', $subject)->where('sender_id', $receiver->id)->value('id')
                : null;
            Message::create([
                'sender_id'   => $sender->id,
                'receiver_id' => $receiver->id,
                'subject'     => $subject,
                'body'        => $body,
                'parent_id'   => $parentId,
            ]);
        }

        $this->command->info('Created additional messages');

        // 4. More notifications — blog_posted for each student blog author's friends
        $blogs = Blog::whereNotNull('submitted_by')->inRandomOrder()->take(15)->get();
        foreach ($blogs as $blog) {
            $author = User::find($blog->submitted_by);
            if (!$author) continue;
            $friends = Message::where('sender_id', $author->id)
                ->orWhere('receiver_id', $author->id)
                ->distinct()
                ->pluck('sender_id')
                ->merge(Message::where('receiver_id', $author->id)->pluck('sender_id'))
                ->unique()
                ->filter(fn($id) => $id !== $author->id);
            foreach ($friends->take(2) as $fid) {
                AppNotification::firstOrCreate([
                    'recipient_id' => $fid,
                    'action_by_id' => $author->id,
                    'blog_id'      => $blog->id,
                    'type'         => 'blog_posted',
                ]);
            }
        }

        // Like notifications
        $likes = Like::inRandomOrder()->take(20)->get();
        foreach ($likes as $like) {
            $blog = Blog::find($like->blog_id);
            if ($blog && $blog->submitted_by && $blog->submitted_by !== $like->user_id) {
                AppNotification::firstOrCreate([
                    'recipient_id' => $blog->submitted_by,
                    'action_by_id' => $like->user_id,
                    'blog_id'      => $blog->id,
                    'type'         => 'like',
                ]);
            }
        }

        $this->command->info('Created additional notifications');

        // 5. More favorites for students
        $blogsForFav = Blog::inRandomOrder()->take(10)->get();
        foreach ($allActive->shuffle()->take(10) as $user) {
            foreach ($blogsForFav->random(rand(1, 2)) as $blog) {
                try {
                    Favorite::firstOrCreate([
                        'user_id' => $user->id,
                        'blog_id' => $blog->id,
                    ]);
                } catch (\Exception $e) {}
            }
        }

        $this->command->info('Created additional favorites');
    }
}
