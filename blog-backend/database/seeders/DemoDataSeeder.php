<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\Blog;
use App\Models\BlogRequest;
use App\Models\Category;
use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\Contact;
use App\Models\Favorite;
use App\Models\Like;
use App\Models\NewsletterSubscriber;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    private array $blogTitles = [
        'How I Overcame My Fear of Public Speaking',
        'Top 10 Study Techniques That Actually Work',
        'Why Reading Books Makes You a Better Writer',
        'A Beginner\'s Guide to Starting a Blog',
        'The Importance of Mental Health for Students',
        'How to Stay Motivated During Exam Season',
        'My Experience Volunteering at a Local Shelter',
        '5 Habits of Highly Successful Students',
        'How Social Media Affects Our Daily Lives',
        'The Art of Writing a Powerful Essay',
        'Why You Should Start Learning a New Language',
        'Tips for Balancing School and Personal Life',
        'How I Built My First Website from Scratch',
        'The Benefits of Joining a Study Group',
        'How to Prepare for College Applications',
        'Why Critical Thinking Matters More Than Ever',
        'My Journey to Becoming a Better Public Speaker',
        'How to Make Friends in a New School',
        'The Power of Keeping a Daily Journal',
        'Understanding Climate Change: A Student\'s Perspective',
        'How to Manage Stress Without Burning Out',
        'Why Extracurricular Activities Matter',
        'The Best Ways to Take Notes in Class',
        'How I Improved My Writing Skills in 30 Days',
        'Dealing with Peer Pressure as a Teen',
        'Why Everyone Should Try Creative Writing',
        'How to Set Goals and Actually Achieve Them',
        'The Role of Technology in Modern Education',
        'How I Found My Passion for Science',
        'Lessons I Learned from My First Part-Time Job',
    ];

    private array $contents = [];

    public function run(): void
    {
        $students = User::whereIn('email', [
            'mahbubul002@gmail.com', 'rafsan003@gmail.com', 'shahriar005@gmail.com',
            'rafsan006@gmail.com', 'fahim007@gmail.com', 'mehedi012@gmail.com',
            'redoanul014@gmail.com', 'alif016@gmail.com', 'sazzath019@gmail.com',
            'shah089@gmail.com', 'rahi088@gmail.com', 'lionel122@gmail.com',
            'neymar123@gmail.com', 'cristiano124@gmail.com'
        ])->get();

        $factoryUsers = User::where('status', 'active')->whereNotIn('email', $students->pluck('email'))->get();
        $categories = Category::all();
        $admin = User::where('is_super_user', true)->first();

        $this->generateContents();

        // 1. Create 2 blogs per student
        $allBlogs = collect();
        foreach ($students as $student) {
            for ($i = 0; $i < 2; $i++) {
                $title = $this->blogTitles[array_rand($this->blogTitles)];
                $category = $categories->random();
                $blog = Blog::create([
                    'title'        => $title,
                    'content'      => $this->contents[array_rand($this->contents)],
                    'blog_pic_url' => 'https://picsum.photos/seed/' . uniqid() . '/800/400',
                    'author_name'  => $student->name,
                    'author_details' => $student->education_status,
                    'time_read'    => rand(2, 10) . ' mins read',
                    'category_id'  => $category->id,
                    'submitted_by' => $student->id,
                    'is_featured'  => false,
                    'is_popular'   => false,
                    'likes_count'  => 0,
                ]);
                $allBlogs->push($blog);
            }
        }

        // Set some as featured and popular
        Blog::inRandomOrder()->take(8)->update(['is_featured' => true]);
        Blog::inRandomOrder()->take(8)->update(['is_popular' => true]);
        // Reset likes_count to 0 before we start adding likes
        Blog::query()->update(['likes_count' => 0]);

        $this->command->info('Created ' . $allBlogs->count() . ' student blogs');

        // 2. Blog requests — some pending, some approved, some rejected
        $requestStatuses = ['pending', 'approved', 'rejected'];
        foreach ($students->random(8) as $student) {
            $status = $requestStatuses[array_rand($requestStatuses)];
            $category = $categories->random();
            $br = BlogRequest::create([
                'title'        => $this->blogTitles[array_rand($this->blogTitles)],
                'content'      => $this->contents[array_rand($this->contents)],
                'category_id'  => $category->id,
                'submitted_by' => $student->id,
                'author_name'  => $student->name,
                'author_details' => $student->education_status,
                'status'       => $status,
                'admin_note'   => $status === 'rejected' ? 'Please revise the content and resubmit.' : null,
                'time_read'    => rand(2, 5) . ' mins read',
            ]);
            if ($status === 'approved') {
                Blog::create([
                    'title'        => $br->title,
                    'content'      => $br->content,
                    'blog_pic_url' => 'https://picsum.photos/seed/' . uniqid() . '/800/400',
                    'author_name'  => $student->name,
                    'category_id'  => $br->category_id,
                    'submitted_by' => $student->id,
                    'time_read'    => $br->time_read,
                ]);
                AppNotification::create([
                    'recipient_id' => $student->id,
                    'action_by_id' => $admin->id,
                    'type'         => 'request_approved',
                ]);
            }
        }
        $this->command->info('Created blog requests');

        // 3. Contact messages
        $subjects = ['General Inquiry', 'Collaboration', 'Feedback', 'Support', 'Partnership'];
        $contactMessages = [
            'I would like to know more about the platform and how I can contribute as a writer.',
            'Great platform! I have some suggestions for improving the user interface.',
            'I am interested in collaborating on a writing project. Please reach out to me.',
            'I faced some issues while submitting my blog. Can you help me resolve them?',
            'Your platform has helped me improve my writing skills. Thank you so much!',
            'I want to report a bug I found in the comment section.',
            'Can you add more categories for science and technology topics?',
        ];
        foreach ($students->random(10) as $student) {
            Contact::create([
                'name'    => $student->name,
                'email'   => $student->email,
                'subject' => $subjects[array_rand($subjects)],
                'message' => $contactMessages[array_rand($contactMessages)],
            ]);
        }
        $this->command->info('Created contact messages');

        // 4. Comments on blogs (by students and factory users)
        $commentTexts = [
            'This is a wonderful article! Very helpful for students like me.',
            'I totally agree with your points. Keep up the great work!',
            'Thanks for sharing your experience. It really inspired me.',
            'Can you write more about this topic? I found it very insightful.',
            'I have tried this method and it works perfectly. Great advice!',
            'Well written! I shared this with my classmates.',
            'This is exactly what I needed to read today. Thank you!',
            'I have a different perspective on this, but I respect your opinion.',
            'Amazing content! Looking forward to more articles from you.',
            'Could you provide some references for the statistics mentioned?',
            'This changed my way of thinking. Really powerful stuff.',
            'Simple yet effective tips. I will definitely try these out.',
        ];
        $allBlogsPosts = Blog::all();
        foreach ($allBlogsPosts->random(min(25, $allBlogsPosts->count())) as $blog) {
            $commentCount = rand(2, 5);
            $commenters = $students->merge($factoryUsers)->shuffle();
            for ($i = 0; $i < $commentCount && $i < $commenters->count(); $i++) {
                Comment::create([
                    'blog_id'   => $blog->id,
                    'user_id'   => $commenters[$i]->id,
                    'text'      => $commentTexts[array_rand($commentTexts)],
                ]);
            }
        }
        $this->command->info('Created comments');

        // 5. Likes on blogs
        foreach ($allBlogsPosts as $blog) {
            $likers = $students->merge($factoryUsers)->shuffle()->take(rand(2, 8));
            foreach ($likers as $liker) {
                try {
                    Like::create(['blog_id' => $blog->id, 'user_id' => $liker->id]);
                    $blog->increment('likes_count');
                } catch (\Exception $e) {
                    // skip duplicates
                }
            }
        }
        $this->command->info('Created likes');

        // 6. Favorites
        foreach ($students->shuffle()->take(8) as $student) {
            foreach ($allBlogsPosts->random(rand(1, 3)) as $blog) {
                try {
                    Favorite::create(['blog_id' => $blog->id, 'user_id' => $student->id]);
                } catch (\Exception $e) {}
            }
        }
        $this->command->info('Created favorites');

        // 7. Comment reports
        $reportReasons = ['spam', 'harassment', 'inappropriate', 'misinformation', 'other'];
        $reportStatuses = ['pending', 'reviewed', 'dismissed'];
        $reportedComments = Comment::inRandomOrder()->take(6)->get();
        foreach ($reportedComments as $comment) {
            CommentReport::create([
                'comment_id' => $comment->id,
                'reported_by' => $students->random()->id,
                'reason'     => $reportReasons[array_rand($reportReasons)],
                'status'     => $reportStatuses[array_rand($reportStatuses)],
            ]);
        }
        $this->command->info('Created comment reports');

        // 8. Newsletter subscriptions
        foreach ($students->random(6) as $student) {
            NewsletterSubscriber::create([
                'name'  => $student->name,
                'email' => $student->email,
            ]);
        }
        $this->command->info('Created newsletter subscribers');

        // 9. Notifications for students
        foreach ($students->random(6) as $student) {
            AppNotification::create([
                'recipient_id' => $student->id,
                'action_by_id' => $admin->id,
                'type'         => 'welcome',
            ]);
        }
        $this->command->info('Created notifications');

        // 10. Update site settings with rich content
        $settings = SiteSetting::first();
        if ($settings) {
            $settings->update([
                'site_title'    => 'ClassRoom Writes',
                'hero_title'    => 'Welcome to ClassRoom Writes',
                'hero_subtitle' => 'A space for students to share stories, ideas, and creative writing with the world.',
                'footer_text'   => 'Built with love for student writers everywhere.',
                'social_links'  => [
                    'twitter'   => 'https://twitter.com/classroomwrites',
                    'linkedin'  => 'https://linkedin.com/company/classroomwrites',
                    'instagram' => 'https://instagram.com/classroomwrites',
                ],
                'about_page'    => [
                    'name'  => 'MD. Shahariar Emon Saikat',
                    'bio'   => 'Founder of ClassRoom Writes. Passionate about creating a platform where young writers can express themselves freely and build their writing skills.',
                    'roles' => [
                        ['title' => 'Founder & Developer', 'organization' => 'ClassRoom Writes'],
                        ['title' => 'Student', 'organization' => 'University'],
                    ],
                    'social_links' => [
                        'linkedin' => 'https://linkedin.com/in/shahariaremon',
                        'twitter'  => 'https://twitter.com/shahariaremon',
                        'facebook' => 'https://facebook.com/shahariaremon',
                        'email'    => 'shahariar@classroomwrites.com',
                    ],
                ],
                'contact_page'  => [
                    'heading'     => 'Get in Touch',
                    'description' => 'Have a question, suggestion, or just want to say hello? We would love to hear from you!',
                    'phones'      => ['+880 1234 567 890', '+880 9876 543 210'],
                    'emails'      => ['hello@classroomwrites.com', 'support@classroomwrites.com'],
                    'addresses'   => ['Dhaka, Bangladesh'],
                    'map_embed'   => '',
                    'form_fields' => ['name', 'email', 'subject', 'message'],
                ],
            ]);
        }
        $this->command->info('Updated site settings');
    }

    private function generateContents(): void
    {
        $this->contents = [
            "Have you ever thought about this topic deeply? Many students face similar questions every day, and yet we rarely take the time to explore them. In this article, I want to share my personal experience and what I have learned along the way.\n\nWhen I first started thinking about this subject, I had no idea how much it would change my perspective. It all began during my sophomore year when a teacher introduced me to a new way of looking at things. That single moment sparked a curiosity that has stayed with me ever since.\n\nOne of the most important lessons I have learned is that progress takes time. There is no shortcut to mastery, but every small step counts. Whether you are studying for an exam, learning a new skill, or working on a personal project, consistency matters more than talent.\n\nI remember struggling at first. There were days when I wanted to give up because the results were not visible. But looking back, those struggles were the very things that helped me grow the most. Challenges are not roadblocks — they are stepping stones.\n\nAnother thing I discovered is the power of community. Surrounding yourself with like-minded people who share your goals makes a huge difference. They keep you accountable, motivate you when you are down, and celebrate your wins with you.\n\nIf you are reading this and feeling unsure about your own journey, know that you are not alone. Everyone starts somewhere. What matters is that you keep going, keep learning, and keep believing in yourself.",
            "In today's fast-paced world, it is easy to get overwhelmed by the constant flow of information and expectations. As students, we often find ourselves juggling multiple responsibilities — classes, assignments, exams, extracurricular activities, and social life. Finding balance is not easy, but it is possible.\n\nThe first step is to prioritize. Not everything that demands your attention deserves it. Learn to distinguish between what is urgent and what is important. This simple mental shift can save you hours of wasted time and reduce stress significantly.\n\nAnother key is to build a routine that works for you. Some people are most productive in the morning, while others hit their stride late at night. Experiment with different schedules until you find what fits your natural rhythm. There is no one-size-fits-all solution.\n\nDo not forget to take care of your health. Sleep, exercise, and proper nutrition are not optional — they are essential for peak performance. A well-rested mind learns faster, thinks clearer, and remembers more.\n\nFinally, be kind to yourself. You will not get everything right on the first try. Mistakes are part of the learning process. What matters is that you learn from them and keep moving forward.",
            "Technology has transformed the way we learn, communicate, and interact with the world. From online courses and virtual classrooms to educational apps and digital libraries, the possibilities are endless. But with great power comes great responsibility.\n\nOne of the biggest challenges of the digital age is staying focused. Social media, games, and endless notifications compete for our attention every second. Developing the discipline to put down your phone and concentrate on your studies is a skill that will serve you for life.\n\nOn the other hand, technology can be a powerful ally when used wisely. Tools like flashcard apps, note-taking software, and collaborative platforms can enhance your learning experience and help you stay organized.\n\nThe key is to be intentional about your technology use. Ask yourself: Is this helping me achieve my goals, or is it just a distraction? The answer will guide you toward better habits and more productive study sessions.",
            "Writing is one of the most important skills you can develop as a student. Whether you are crafting an essay, writing a blog post, or sending an email, the ability to express your thoughts clearly and persuasively will open doors throughout your life.\n\nMany students struggle with writing because they feel they have nothing interesting to say. But the truth is, everyone has a unique perspective. Your experiences, opinions, and ideas matter. The challenge is learning how to put them into words.\n\nStart by reading more. The best writers are avid readers. Pay attention to how your favorite authors structure their sentences, build their arguments, and engage their readers. You will naturally absorb these techniques over time.\n\nPractice regularly. Set aside time each day to write, even if it is just for fifteen minutes. Keep a journal, start a blog, or write letters to friends. The more you write, the easier it becomes.\n\nDo not be afraid of feedback. Share your writing with others and ask for their honest opinion. Constructive criticism is one of the fastest ways to improve. Remember, every great writer started as a beginner.",
        ];
    }
}
