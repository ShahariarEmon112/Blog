# Blog Platform — Full Implementation Guide

## Context

Build a full-stack blog platform from scratch. Two projects living side-by-side:

- **`blog-backend/`** — Laravel 11 + MySQL 8, exposes a JSON API for the frontend and also serves a small Blade-based admin dashboard (the Blade side is what satisfies a set of framework-teaching requirements listed further below).
- **`blog-frontend/`** — Next.js 14 (App Router) with Mantine + Tailwind + React Query, consuming the Laravel API.

The platform hosts long-form blog posts written or submitted by students, moderated by an admin.

### Design constraints (hard rules)

1. **No password reset flow anywhere.** If a user forgets their password, the admin resets it manually from the admin panel — or the account is deleted and re-created. The registration form has no "Forgot password?" link and no `/forgot-password` route.
2. **No SMTP / email sending.** No Nodemailer, no Laravel Mail facade calls, no third-party mail providers. Actions that would traditionally send email (welcome, newsletter blast, notifications) instead write an entry to `storage/logs/laravel.log` for observability and do nothing else.
3. **No email verification.** Signup accepts just `name`, `email`, `password`. New accounts are created in status `pending`; **only an admin can activate them** from an admin "Pending Users" queue. Login rejects `pending` and `banned` users with a clear message.
4. **One-command seeded database.** Running `php artisan migrate:fresh --seed` on any machine populates MySQL with an admin, a handful of regular users (some pending, so the approval queue has content), categories, blogs, comments, and default site settings. This is what makes cloning the repo onto a new machine painless.

### Confirmed tech decisions

| Concern | Choice | Why |
|---|---|---|
| Backend framework | Laravel 11 | Modern PHP, batteries-included, aligns with lab-teaching topics |
| Database | MySQL 8 | Relational, easy XAMPP/Laragon setup, taught alongside Laravel |
| Backend auth (API) | Sanctum personal access tokens | Simple Bearer flow, cross-origin friendly |
| Backend auth (Blade) | Laravel Breeze (Blade stack) | Ships login/logout out of the box; satisfies a checklist item |
| Frontend framework | Next.js 14 (App Router) | React with routing/layouts built in |
| Frontend UI kit | Mantine 7 + Tailwind CSS | Mantine gives complete component library; Tailwind for layout utilities |
| Frontend data layer | TanStack React Query v5 | Caching, invalidation, optimistic updates, persistence |
| Rich text editor | TipTap 3 (StarterKit + image + link + underline + placeholder) | Small, extensible, produces clean HTML |
| Toasts | sonner | Simple, themable |
| HTTP client | axios (with request/response interceptors) | Bearer token injection, unified error handling |
| File uploads | Local disk (`storage/app/public` symlinked to `public/storage`) | Zero external accounts required for dev |
| Local toolchain | XAMPP / Laragon / native PHP + MySQL | No Docker required |

---

## Git Conventions (READ BEFORE COMMITTING)

**Every step ends with a commit. Follow these rules on every single commit:**

1. **Use the locally configured git identity.** Whatever `git config user.name` and `git config user.email` are set to on the machine — use those. Do not override them per-commit and do not touch the git config.
2. **Do NOT add Claude, any AI, or any tool as an author or co-author.** No `Co-Authored-By: Claude ...` trailer. No `Generated with Claude Code` line. No `🤖` marker. No mention of AI assistance in the commit message body. The commit should look like it was written by hand.
3. **Do not run `git push`.** Only stage and commit locally. The repository owner will push manually after reviewing the diff.
4. **Do not use `git commit --amend` or `git rebase`** — one commit per step, in the order laid out below. If a step needs a fix, add a new commit on top rather than rewriting history.
5. **Do not skip hooks** (no `--no-verify`, no `--no-gpg-sign`). If a pre-commit hook fails, fix the underlying issue and try again.
6. **Do not use `git add -A` or `git add .` blindly.** Stage only the files that belong to the current step. This keeps commits scoped and reviewable.

**Commit message format** (this is what each step's "Commit:" line shows — use it verbatim or a very close variant):

```
<type>(<scope>): <short summary in lowercase, no trailing period>

<optional body — only if additional context is genuinely useful>
```

Where `<type>` is one of `feat`, `fix`, `chore`, `refactor`, `docs`, `test`. Keep the subject line under 72 characters. **The message body must not reference Claude, AI, or any code-generation tool.**

Correct example:
```
feat(api): Sanctum register/login/logout/me with pending-approval enforcement
```

Incorrect (do not do this):
```
feat(api): Sanctum register/login/logout/me with pending-approval enforcement

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Lab Checklist Coverage Map

The Blade side of the Laravel app must demonstrate these framework concepts. Each has a specific step where it's implemented.

| # | Requirement | Where |
|---|---|---|
| 1 | Laravel installed via Composer + folder structure understood | **Step 1** |
| 2 | Route with parameters + Blade view with conditionals/loops/layouts | **Step 6** — `Route::get('/dashboard/{section}')` with `@extends`, `@section`, `@if`, `@foreach` |
| 3 | Resource controller with full CRUD (migration + model + `$fillable` + validation) | **Steps 3 + 7** — `BlogController --resource` + `StoreBlogRequest` / `UpdateBlogRequest` |
| 4 | Custom middleware with a parameter like `country:BD` | **Step 4** — `EnsureCountry` middleware, `handle($req, $next, $country)` |
| 5 | Middleware registered as an alias + applied to a route group | **Step 4** — alias `country` in `bootstrap/app.php`, `Route::middleware('country:BD')->group(...)` |
| 6 | External API integration via Guzzle | **Step 5** — `QuoteService` calls `https://zenquotes.io/api/random` |
| 7 | Laravel Breeze auth protecting a route + logout | **Step 1** — Breeze installs `/dashboard` behind `auth`; **Step 6** puts the parameterised route behind `auth,country:BD` |
| 8 | AJAX endpoint returning JSON, consumed via `fetch`/async-await | **Step 8** — `/dashboard/latest-blogs.json` + inline JS on the Blade page |
| 9 | CSRF tokens + method spoofing (`@csrf`, `@method`) | **Step 7** — every Blade form in the resource CRUD uses them |

---

## Feature List (what the finished app does)

### Visitor (public, no login)
- Landing page: hero, category carousel, featured blogs, recent blogs.
- Full blog list (`/blogs`): search by title, filter by category, sort, paginate (6 per page).
- Category page (`/category/[slug]`): all blogs in that category.
- Blog detail (`/blogs/[id]`): full HTML content, threaded comments (top-level + one level of replies), like button with count, favorite button with count.
- Static pages: About + Contact (both fully admin-editable content, including a Google Maps embed URL).
- Contact form.
- Newsletter subscribe (name + unique email).
- Dark/light theme toggle.

### Authenticated reader
- Favorite / unfavorite any blog.
- Post comments and replies.
- Edit and delete own comments.
- Like / unlike blogs.
- Report a comment (reason enum: `spam|harassment|inappropriate|misinformation|other`; unique per user + comment).
- Submit a "blog request" (draft with image + rich text) for admin review.
- Track own submissions (`/my-requests`): status pending / approved / rejected.
- View own approved blogs (`/my-blogs`).
- Edit own profile (name + avatar with client-side image compression).
- In-app notification bell: like/comment/favorite events on their content, plus request-approved events.

### Admin (super-user)
- Blog CRUD via the API (list, create, edit, delete, toggle featured with a hard cap of 5).
- Blog request queue: view, edit-pre-approval, approve (creates a Blog), reject with optional note.
- **Pending users queue: approve or delete new signups (this drives modification #3).**
- User management: virtualized list, ban/unban, delete with cascade.
- Category management: add/rename/delete (delete blocked while any blog uses it).
- Comment report moderation: pending / reviewed / dismissed; delete the offending comment.
- Contact inbox: mark read, delete.
- Newsletter subscriber list: view, remove.
- Site customization: hero title/subtitle, about page (name, bio, roles list, image, social links), contact page (headings, phones, emails, address, map embed), footer text, site logo.
- (Blade side) Small internal dashboard at `/dashboard/{section}` with live stats + AJAX widgets — this is what fulfils the lab checklist.

---

## Data Model

Tables + relationships (all foreign keys use `onDelete('cascade')` unless noted).

```
users
  id, name, email (unique), password
  status ENUM('pending','active','banned') DEFAULT 'pending'
  is_super_user BOOL DEFAULT false
  avatar NULL, author_details NULL
  timestamps

categories
  id, name (unique), slug (unique), image NULL, timestamps

blogs
  id, title, content LONGTEXT
  category_id → categories.id ON DELETE SET NULL
  submitted_by → users.id ON DELETE SET NULL
  author_name, author_avatar NULL, author_details NULL
  blog_pic_url NULL, time_read DEFAULT '3 mins read'
  is_featured BOOL, is_popular BOOL, likes_count UNSIGNED INT
  publish_date DATE, timestamps

comments
  id, text TEXT
  user_id → users.id CASCADE
  blog_id → blogs.id CASCADE
  parent_id → comments.id CASCADE, NULLABLE   (nested replies)
  timestamps

likes         (id, user_id, blog_id, timestamps, UNIQUE(user_id, blog_id))
favorites     (same shape as likes)

blog_requests
  id, title, category_id (SET NULL), content LONGTEXT
  blog_image NULL, author_name, author_avatar NULL, author_details NULL
  time_read, submitted_by → users.id CASCADE
  status ENUM('pending','approved','rejected') DEFAULT 'pending'
  admin_note NULL, timestamps

comment_reports
  id, comment_id → comments.id CASCADE
  reported_by → users.id CASCADE
  reason ENUM(...), description NULL
  status ENUM('pending','reviewed','dismissed') DEFAULT 'pending'
  timestamps, UNIQUE(comment_id, reported_by)

contacts
  id, name, email, phone NULL, subject, message TEXT, is_read BOOL, timestamps

newsletter_subscribers
  id, name, email (unique), timestamps

app_notifications     (renamed from `notifications` to avoid clashing with Laravel's built-in notifications table)
  id, recipient_id → users.id CASCADE
  action_by_id → users.id CASCADE
  blog_id → blogs.id CASCADE
  comment_id → comments.id CASCADE NULLABLE
  type ENUM('like','comment','favorite','request_approved')
  read BOOL, timestamps

site_settings         (singleton row)
  id, site_title, site_logo, hero_title, hero_subtitle, footer_text TEXT
  social_links JSON, about_page JSON, contact_page JSON, timestamps
```

Relationships in code (Eloquent):

- `User hasMany Blog` (via `submitted_by`), `hasMany Comment`, `hasMany Favorite`, `hasMany Like`, `hasMany BlogRequest`, `hasMany AppNotification` (via `recipient_id`).
- `Blog belongsTo Category`, `belongsTo User` (author, via `submitted_by`), `hasMany Comment`, `hasMany Like`, `hasMany Favorite`.
- `Comment belongsTo User`, `belongsTo Blog`, `belongsTo Comment` as `parent`, `hasMany Comment` as `replies`.
- `SiteSetting` casts `social_links`, `about_page`, `contact_page` to `array`.

---

## Step-by-Step Plan

Each step below is designed to be:
- **Small enough to commit on its own.**
- **Self-contained** — a fresh AI agent (or a fresh developer) with only this document and no prior context can complete it.
- **Educational** — each step names the concept it teaches.

Feed one step at a time to your implementer. Review the diff, commit, then move to the next.

---

### PHASE A — Laravel backend foundation & lab-checklist coverage

---

#### **Step 1 — Scaffold Laravel + MySQL + Breeze (Blade stack)**

**Concept:** Laravel project structure (`app/`, `routes/`, `resources/`, `database/`, `bootstrap/`, `config/`), how Composer installs frameworks, and how Breeze provides a working auth system with Blade views out of the box.

**Instructions:**
1. Create the backend project: `composer create-project laravel/laravel blog-backend`. `cd blog-backend`.
2. Create a MySQL database: `mysql -u root -e "CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`.
3. Copy `.env.example` → `.env`. Set `DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=blog`, `DB_USERNAME=root`, `DB_PASSWORD=` (or your local password). Set `APP_URL=http://localhost:8000`, `APP_NAME="Blog Platform"`. Run `php artisan key:generate`.
4. Run `php artisan migrate` to create Laravel's default `users`, `sessions`, `password_reset_tokens`, `cache`, `jobs` tables.
5. Install Breeze with the **Blade** stack: `composer require laravel/breeze --dev`, then `php artisan breeze:install blade` (accept defaults: no dark mode, no Pest). Run `npm install && npm run build`.
6. **Fulfil design constraint #1 (no password reset):** delete `resources/views/auth/forgot-password.blade.php`, `reset-password.blade.php`, `confirm-password.blade.php`. Delete `app/Http/Controllers/Auth/PasswordResetLinkController.php`, `NewPasswordController.php`, `ConfirmablePasswordController.php`, `PasswordController.php`. Remove their route registrations from `routes/auth.php`.
7. **Fulfil design constraint #3 groundwork (no email verification):** delete `app/Http/Controllers/Auth/VerifyEmailController.php` and `EmailVerificationNotificationController.php`, remove their routes from `routes/auth.php`, remove `MustVerifyEmail` from `app/Models/User.php` if present.
8. `php artisan serve` and verify: `http://localhost:8000` shows the welcome page, `/register` and `/login` render, `/dashboard` redirects to login when logged out.

**Commit:** `chore: bootstrap Laravel 11 with Breeze (Blade), remove password reset and email verification scaffolding`

---

#### **Step 2 — Extend the users table for admin-approval workflow**

**Concept:** Layering migrations, MySQL `ENUM` columns, Eloquent `$fillable` / `casts()` / scopes, and overriding Breeze's `RegisteredUserController` to inject business logic.

**Instructions:**
1. `php artisan make:migration add_status_and_role_to_users_table`. In `up()` add: `$table->enum('status', ['pending','active','banned'])->default('pending')->after('email')`, `$table->boolean('is_super_user')->default(false)->after('status')`, `$table->string('avatar')->nullable()->after('is_super_user')`, `$table->string('author_details')->nullable()->after('avatar')`. Reverse in `down()`.
2. Update `app/Models/User.php`:
   - Add `'status','is_super_user','avatar','author_details'` to `$fillable`.
   - Add `'is_super_user' => 'boolean'` to `casts()`.
   - Add a scope `public function scopeActive($q) { return $q->where('status', 'active'); }`.
3. Edit `app/Http/Controllers/Auth/RegisteredUserController.php`:
   - Set `status => 'pending'` in the `User::create([...])` call.
   - Remove `event(new Registered($user))` (there's no verification email to send).
   - Remove `Auth::login($user)`. Redirect to a new view `resources/views/auth/pending-approval.blade.php` that says "Your account is awaiting admin approval."
4. Edit `app/Http/Controllers/Auth/AuthenticatedSessionController.php`:
   - After `$request->authenticate()`, check `Auth::user()->status`. If not `active`, call `Auth::logout()`, invalidate the session, and redirect back with an error: `pending` → "Your account is awaiting admin approval." / `banned` → "Your account has been banned."
5. `php artisan migrate`. Register a new user via `/register`; confirm the pending-approval screen appears and login refuses that user.

**Commit:** `feat(auth): pending/active/banned status + is_super_user, block non-active logins`

---

#### **Step 3 — Domain migrations + Eloquent models**

**Concept:** Translating the "Data Model" section above into MySQL tables with foreign keys and cascade rules; declaring `$fillable`, `casts()`, and relationships on Eloquent models.

**Instructions:**

For each table in the Data Model section, create a migration (`php artisan make:migration create_<name>_table`) with the exact fields listed. Order matters — later tables reference earlier ones via foreign keys. Suggested creation order: **categories → blogs → comments → likes → favorites → blog_requests → comment_reports → contacts → newsletter_subscribers → app_notifications → site_settings**.

Then create models: `php artisan make:model Category`, `Blog`, `Comment`, `Like`, `Favorite`, `BlogRequest`, `CommentReport`, `Contact`, `NewsletterSubscriber`, `AppNotification` (set `protected $table = 'app_notifications'`), `SiteSetting`.

For each model:
- Set `$fillable` explicitly (never `$guarded = []` — a common security foot-gun).
- Declare the relationships listed in the Data Model section.
- On `SiteSetting`, cast the JSON columns: `protected $casts = ['social_links' => 'array', 'about_page' => 'array', 'contact_page' => 'array'];`.
- On `Blog`, `Comment`, and any model with dates you plan to expose, keep the default `created_at` / `updated_at`.

`php artisan migrate`. In MySQL, run `SHOW TABLES;` to confirm 11 new tables exist alongside Laravel defaults.

**Commit:** `feat(db): domain migrations and Eloquent models (categories, blogs, comments, likes, favorites, blog_requests, comment_reports, contacts, newsletter_subscribers, app_notifications, site_settings)`

---

#### **Step 4 — Custom parameterised middleware `country:BD`** ✅ LAB ITEM

**Concept:** `handle($request, $next, ...$params)` signature receives arguments from `middleware('country:BD')`; middleware aliases registered in `bootstrap/app.php` (Laravel 11 style — no more `Kernel.php`); applying middleware to a route **group**.

**Instructions:**
1. `php artisan make:middleware EnsureCountry`.
2. In `app/Http/Middleware/EnsureCountry.php`:
   ```php
   public function handle(Request $request, Closure $next, string $country): Response
   {
       $requestCountry = $request->header('X-Country')
           ?? $request->query('country')
           ?? config('app.default_country', 'BD');
       if (strtoupper($requestCountry) !== strtoupper($country)) {
           abort(403, "This section is only available in {$country}. Detected: {$requestCountry}");
       }
       return $next($request);
   }
   ```
3. In `bootstrap/app.php`, inside `->withMiddleware(function (Middleware $middleware) { ... })`, add:
   ```php
   $middleware->alias(['country' => \App\Http\Middleware\EnsureCountry::class]);
   ```
4. In `routes/web.php`, create a route group (the controller will be built in Step 6 — for now a placeholder closure keeps the app booting):
   ```php
   Route::middleware(['auth', 'country:BD'])->group(function () {
       Route::get('/dashboard/{section}', fn($section) => "section: $section")
           ->name('dashboard.section');
   });
   ```
5. Verify: log in, visit `/dashboard/overview` — 200. Send `X-Country: US` → 403.

**Commit:** `feat(middleware): EnsureCountry with alias 'country' applied to dashboard group`

---

#### **Step 5 — Guzzle external API integration** ✅ LAB ITEM

**Concept:** Explicitly require Guzzle (Laravel's HTTP client wraps it but the direct dependency ticks the box), write a service class in `app/Services/`, cache external responses with `Cache::remember`, and inject a service into a controller via constructor.

**Instructions:**
1. `composer require guzzlehttp/guzzle`.
2. Create `app/Services/QuoteService.php`:
   ```php
   <?php
   namespace App\Services;
   use GuzzleHttp\Client;
   use Illuminate\Support\Facades\Cache;

   class QuoteService
   {
       public function __construct(private ?Client $client = null)
       {
           $this->client ??= new Client(['timeout' => 5]);
       }

       public function quoteOfTheDay(): array
       {
           return Cache::remember('quote-of-the-day', now()->addHour(), function () {
               try {
                   $res = $this->client->get('https://zenquotes.io/api/random');
                   $data = json_decode((string) $res->getBody(), true);
                   return ['quote' => $data[0]['q'] ?? '', 'author' => $data[0]['a'] ?? ''];
               } catch (\Throwable $e) {
                   return ['quote' => 'Words are the voice of the heart.', 'author' => 'Anonymous'];
               }
           });
       }
   }
   ```
3. In `app/Providers/AppServiceProvider.php` `register()`: `$this->app->singleton(QuoteService::class);`.
4. Add a public endpoint in `routes/api.php`:
   ```php
   use App\Services\QuoteService;
   Route::get('/quote', fn(QuoteService $s) => response()->json($s->quoteOfTheDay()));
   ```

**Commit:** `feat(services): QuoteService using Guzzle to fetch daily quote from zenquotes.io`

---

#### **Step 6 — Blade dashboard with route parameters, layouts, conditionals, loops** ✅ LAB ITEM

**Concept:** Blade template inheritance (`@extends`, `@section`, `@yield`), partials (`@include`), control structures (`@if`, `@foreach`, `@forelse`), and rendering a page whose content varies by URL segment.

**Instructions:**
1. `php artisan make:controller DashboardController`. Add:
   ```php
   use App\Services\QuoteService;
   use App\Models\{Blog, User, Category};

   public function show(string $section, QuoteService $quotes)
   {
       abort_unless(in_array($section, ['overview','blogs','users']), 404);
       $stats = [
           'blogs'      => Blog::count(),
           'users'      => User::count(),
           'pending'    => User::where('status','pending')->count(),
           'categories' => Category::count(),
       ];
       $recentBlogs = Blog::latest()->take(5)->get();
       return view('dashboard.section', compact('section', 'stats', 'recentBlogs', 'quotes'));
   }
   ```
2. Create `resources/views/layouts/admin.blade.php` — Breeze's Tailwind base + a sidebar (`@include('partials.sidebar')`) + `@yield('content')` + `@stack('scripts')` right before `</body>`.
3. Create `resources/views/partials/sidebar.blade.php` — a `<nav>` with a `@foreach (['overview','blogs','users'] as $item)` loop, using `@if (request()->route('section') === $item)` to highlight the active link. Each link uses `route('dashboard.section', $item)`.
4. Create `resources/views/dashboard/section.blade.php`:
   ```blade
   @extends('layouts.admin')
   @section('content')
     <h1>Dashboard — {{ ucfirst($section) }}</h1>
     @if ($section === 'overview')
       <div class="grid grid-cols-4 gap-4">
         @foreach ($stats as $label => $value)
           <div class="p-4 bg-white rounded shadow">
             <div class="text-gray-500">{{ ucfirst($label) }}</div>
             <div class="text-3xl">{{ $value }}</div>
           </div>
         @endforeach
       </div>
       <h2 class="mt-8">Recent posts</h2>
       <ul>
         @forelse ($recentBlogs as $blog)
           <li>{{ $blog->title }} — <span class="text-gray-400">{{ $blog->created_at->diffForHumans() }}</span></li>
         @empty
           <li>No blogs yet.</li>
         @endforelse
       </ul>
       {{-- Widgets filled in by AJAX in Step 8 --}}
       <ul id="recent-live" class="mt-4">Loading…</ul>
       <blockquote id="quote-widget" class="mt-8 p-4 border-l-4">Loading quote…</blockquote>
     @elseif ($section === 'blogs')
       @include('dashboard.blogs-panel')
     @elseif ($section === 'users')
       @include('dashboard.users-panel')
     @endif
   @endsection
   ```
5. Create `dashboard/blogs-panel.blade.php` ("Blog management is under `/blogs` — see the resource CRUD.") and `dashboard/users-panel.blade.php` (list pending users with a `@foreach`).
6. Replace the placeholder closure from Step 4 with the real route: `Route::get('/dashboard/{section}', [DashboardController::class, 'show'])->name('dashboard.section');`. Also add `Route::redirect('/dashboard', '/dashboard/overview');` so Breeze's default link still works.
7. Verify: `/dashboard/overview`, `/dashboard/blogs`, `/dashboard/users` each render distinct content. `/dashboard/nonsense` returns 404.

**Commit:** `feat(blade): parameterised dashboard with layout, conditionals, and loops`

---

#### **Step 7 — Blog resource CRUD (Blade) with FormRequest validation + CSRF + method spoofing** ✅ LAB ITEM

**Concept:** `Route::resource` mapping to 7 controller methods (index/create/store/show/edit/update/destroy); centralising validation via `FormRequest` classes; `@csrf` and `@method('PUT'|'DELETE')` on HTML forms; mass-assignment protection via `$fillable`.

**Instructions:**
1. `php artisan make:controller BlogController --resource`.
2. `php artisan make:request StoreBlogRequest`, `php artisan make:request UpdateBlogRequest`.
3. In `StoreBlogRequest`:
   ```php
   public function authorize(): bool { return auth()->check() && auth()->user()->is_super_user; }
   public function rules(): array {
       return [
           'title'          => 'required|string|max:255',
           'content'        => 'required|string',
           'category_id'    => 'required|exists:categories,id',
           'author_name'    => 'required|string|max:255',
           'author_details' => 'nullable|string|max:500',
           'time_read'      => 'nullable|string|max:32',
           'blog_pic'       => 'nullable|image|max:5120',
           'author_avatar'  => 'nullable|image|max:2048',
           'is_featured'    => 'boolean',
           'publish_date'   => 'nullable|date',
       ];
   }
   ```
   `UpdateBlogRequest` has the same rules but each rule prefixed with `sometimes|`.
4. In `BlogController`:
   - `index()` → paginate 10, eager-load `category`, return `blogs.index` view.
   - `create()` → return `blogs.create` view with `Category::all()`.
   - `store(StoreBlogRequest $req)` → store uploaded files via `$req->file('blog_pic')?->store('blogs', 'public')`, `Blog::create($validated + $paths)`, redirect to `blogs.index` with `->with('success', 'Created')`.
   - `show(Blog $blog)`, `edit(Blog $blog)`, `update(UpdateBlogRequest $req, Blog $blog)`, `destroy(Blog $blog)` follow the same pattern.
5. Route: inside `Route::middleware('auth')->group(...)` in `routes/web.php`: `Route::resource('blogs', BlogController::class);`.
6. Blade views under `resources/views/blogs/`:
   - `index.blade.php` — table, `@foreach ($blogs as $blog)`, `{{ $blogs->links() }}`, each row with an Edit link and a Delete form using `@csrf` + `@method('DELETE')`.
   - `create.blade.php` — `<form method="POST" enctype="multipart/form-data" action="{{ route('blogs.store') }}">` with `@csrf`. Show `@error('title') <p>{{ $message }}</p> @enderror` under each field.
   - `edit.blade.php` — same form but with `@method('PUT')` and `old('title', $blog->title)` on inputs.
   - `show.blade.php` — read-only detail view + Back link.
7. Verify with a promoted admin (temporarily: `php artisan tinker` → `User::first()->update(['is_super_user' => true, 'status' => 'active'])`): full round-trip create → edit → delete. Submit an empty title → validation error shown inline.

**Commit:** `feat(blog-admin): resource CRUD with FormRequest validation, CSRF, method spoofing, pagination`

---

#### **Step 8 — AJAX JSON endpoint consumed via `fetch` + async-await** ✅ LAB ITEM

**Concept:** Returning JSON from a Laravel route, consuming it from vanilla JS with `async/await`, and Blade's `@push`/`@stack` for injecting scripts into a layout.

**Instructions:**
1. In `routes/web.php`, inside the `auth` group:
   ```php
   Route::get('/dashboard/latest-blogs.json', function () {
       return response()->json([
           'blogs' => \App\Models\Blog::latest()->take(5)->get(['id','title','created_at']),
       ]);
   })->name('dashboard.latest');
   ```
2. In `resources/views/dashboard/section.blade.php`, append:
   ```blade
   @push('scripts')
   <script>
     (async () => {
       // AJAX endpoint returning JSON — consumed via fetch/async-await
       const res = await fetch('{{ route("dashboard.latest") }}', { headers: { 'Accept': 'application/json' } });
       if (res.ok) {
         const { blogs } = await res.json();
         const el = document.getElementById('recent-live');
         if (el) el.innerHTML = blogs.map(b => `<li>${b.title}</li>`).join('') || '<li>No blogs</li>';
       }
       const q = await fetch('/api/quote').then(r => r.json());
       const qw = document.getElementById('quote-widget');
       if (qw) qw.innerHTML = `"${q.quote}" — <em>${q.author}</em>`;
     })();
   </script>
   @endpush
   ```
3. Verify: DevTools → Network → refresh `/dashboard/overview`. Two XHR calls appear (`latest-blogs.json`, `/api/quote`), each returning JSON, DOM updates.

**Commit:** `feat(dashboard): AJAX widgets (latest blogs, quote of day) via fetch/async-await`

---

### PHASE B — JSON API for the Next.js frontend

---

#### **Step 9 — Sanctum + API `AuthController` (register / login / logout / me)**

**Concept:** Sanctum personal-access-token flow (`->createToken()->plainTextToken`), the `auth:sanctum` middleware, and enforcing the pending-approval workflow on the API side.

**Instructions:**
1. `php artisan install:api` (Laravel 11+ — this publishes Sanctum's migration and creates `routes/api.php` with a `personal_access_tokens` table).
2. `php artisan migrate`.
3. On `app/Models/User.php`: `use Laravel\Sanctum\HasApiTokens;` and add `use HasApiTokens;` to the trait list.
4. `php artisan make:controller Api/AuthController` with:
   - `register(Request $r)` — validate `name|required|min:3|max:50`, `email|required|email|unique:users`, `password|required|min:8|confirmed`. Create user with `status='pending'`, `is_super_user=false`. Return `201 { message: 'Your account is awaiting admin approval.' }`. **No token issued.**
   - `login(Request $r)` — validate email + password. Fetch user, `Hash::check`. If `status === 'pending'` → 403 with pending message. If `banned` → 403. If `active` → return `200 { token: $user->createToken('spa')->plainTextToken, user: {...} }`.
   - `logout(Request $r)` — `$r->user()->currentAccessToken()->delete(); return response()->noContent();`.
   - `me(Request $r)` — return the authenticated user (hide password, expose `is_super_user`, `avatar`, `status`).
5. In `routes/api.php`:
   ```php
   Route::post('/auth/register', [AuthController::class, 'register']);
   Route::post('/auth/login',    [AuthController::class, 'login']);
   Route::middleware('auth:sanctum')->group(function () {
       Route::post('/auth/logout', [AuthController::class, 'logout']);
       Route::get('/auth/me',      [AuthController::class, 'me']);
   });
   ```
6. Test with curl or the VS Code REST Client:
   - `POST /api/auth/register` → 201 pending message.
   - `POST /api/auth/login` (with a pending user) → 403.
   - Promote via tinker, then `POST /api/auth/login` → 200 + token.
   - `GET /api/auth/me` with `Authorization: Bearer <token>` → user data.

**Commit:** `feat(api): Sanctum register/login/logout/me with pending-approval enforcement`

---

#### **Step 10 — Public blogs API (list, detail, featured, popular, category, mine)**

**Concept:** API Resources for consistent JSON shapes, query-scoped pagination, `withCount('likes','favorites')`.

**Instructions:**
1. `php artisan make:controller Api/BlogController`. Methods:
   - `index(Request $r)` — accept `page`, `per_page` (default 6), `search`, `category` (id or slug), `sort` (default `created_at`), `order` (`asc|desc`). Build query with `->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))`, `->when($category, fn($q) => $q->whereHas('category', fn($c) => $c->where('slug', $category)))`. `->withCount(['likes','favorites'])`. `->paginate($per_page)`.
   - `show(Blog $blog)` — eager-load `['category','author','comments.user','comments.replies.user']`, return `new BlogResource($blog)`.
   - `featured()` — `Blog::where('is_featured', true)->latest()->get()`.
   - `popular()` — `Blog::withCount('favorites')->orderByDesc('favorites_count')->take(10)->get()`.
   - `byCategory(string $slug)` — filter through the relationship.
   - `mine(Request $r)` — `Blog::where('submitted_by', $r->user()->id)->latest()->get()`.
2. `php artisan make:resource BlogResource`. Return a stable shape (`id`, `title`, `content`, `blog_pic_url`, `author_name`, `time_read`, `is_featured`, `likes_count`, `favorites_count`, `created_at`, `category` nested).
3. Wire routes in `routes/api.php` under prefix `/blogs`. `mine` is inside the `auth:sanctum` group.
4. Verify with curl.

**Commit:** `feat(api): public blogs endpoints with pagination, filters, BlogResource`

---

#### **Step 11 — Admin user-approval API + `IsSuperUser` middleware**

**Concept:** A second custom middleware (without a parameter this time), and the endpoints that drive the pending-users queue.

**Instructions:**
1. `php artisan make:middleware IsSuperUser`. Handle:
   ```php
   if (! $request->user() || ! $request->user()->is_super_user) abort(403);
   return $next($request);
   ```
   Register alias in `bootstrap/app.php`: `$middleware->alias(['admin' => \App\Http\Middleware\IsSuperUser::class]);`.
2. `php artisan make:controller Api/Admin/UserController`:
   - `index(Request $r)` — paginated users, filterable by `status`.
   - `pending()` — `User::where('status','pending')->latest()->get()`.
   - `approve(User $user)` — `$user->update(['status' => 'active']);` return `$user`.
   - `ban(User $user)` — toggle status active↔banned.
   - `destroy(User $user)` — `$user->delete();` return `response()->noContent();` (cascades handle child data).
3. Routes:
   ```php
   Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
       Route::get('/users',                 [UserController::class, 'index']);
       Route::get('/users/pending',         [UserController::class, 'pending']);
       Route::post('/users/{user}/approve', [UserController::class, 'approve']);
       Route::patch('/users/{user}/ban',    [UserController::class, 'ban']);
       Route::delete('/users/{user}',       [UserController::class, 'destroy']);
   });
   ```
4. End-to-end verify: register a fresh user → pending. Log in as admin, POST `/api/admin/users/{id}/approve` → the fresh user can now log in.

**Commit:** `feat(api): admin user-management endpoints + IsSuperUser middleware`

---

#### **Step 12 — Blog request workflow API**

Endpoints:
- `POST /api/blog-requests` (auth) — user submits a draft (title, category_id, content, image, author_*, time_read).
- `GET /api/blog-requests/mine` (auth).
- `GET /api/blog-requests` (admin).
- `POST /api/blog-requests/{id}/approve` (admin) — copy fields to a new `Blog`, mark request `approved`, create an `AppNotification` for the submitter with `type='request_approved'`.
- `POST /api/blog-requests/{id}/reject` (admin) — set `status='rejected'` + `admin_note`.
- `PUT /api/blog-requests/{id}` (admin) — edit pre-approval (title, category, content, time_read).
- `DELETE /api/blog-requests/{id}` (admin).

**Commit:** `feat(api): blog request workflow (submit → admin review → approve/reject)`

---

#### **Step 13 — Comments, likes, favorites APIs**

- **Comments:**
  - `POST /api/blogs/{blog}/comments` (auth) — body `{ text, parent_id? }`. If `parent_id` set, the new comment is a reply.
  - `PATCH /api/comments/{comment}` (auth) — only the author can edit.
  - `DELETE /api/comments/{comment}` (auth) — only the author can delete.
  - Cascade replies via `parent_id` foreign key.
- **Likes:** `POST /api/blogs/{blog}/like`, `DELETE /api/blogs/{blog}/like`. Enforce uniqueness. On like, increment `blogs.likes_count`; on unlike, decrement.
- **Favorites:** `POST /api/favorites/{blog}`, `DELETE /api/favorites/{blog}`, `GET /api/favorites` (auth), `GET /api/favorites/count/{blog}` (public), `GET /api/favorites/check/{blog}` (auth).
- Every like / favorite / comment creates an `AppNotification` for the blog owner (skip if actor is owner). New comments on a reply also notify the parent-comment author.

**Commit:** `feat(api): comments (with replies), likes, favorites + notification hooks`

---

#### **Step 14 — Categories, site settings, file uploads**

- `Api/CategoryController`: public `index`. Admin `store`, `update`, `destroy`. `destroy` returns 409 if `$category->blogs()->exists()`.
- `Api/SiteSettingController`: public `show` (returns `SiteSetting::firstOrCreate([], [defaults])`), admin `update` (partial merge — accept only whitelisted keys).
- File uploads via the `public` disk: `$path = $request->file('image')->store('categories', 'public');` — returns something like `categories/xxx.jpg`. Prepend `Storage::url($path)` in the API response so the frontend gets an absolute-relative URL under `/storage/`.
- Run `php artisan storage:link` once (add a note in the README so future clones remember).

**Commit:** `feat(api): categories CRUD + site settings + public disk uploads`

---

#### **Step 15 — Contact, newsletter, notifications APIs**

- **Contact:** `POST /api/contact` (public) → creates a Contact row. Admin: `GET /api/contact`, `PATCH /api/contact/{id}/read`, `DELETE /api/contact/{id}`.
- **Newsletter:** `POST /api/newsletter` (public, unique email). **Do not send email** (design constraint #2). Instead log: `Log::info('Newsletter signup', ['email' => $req->email]);`. Admin: `GET /api/newsletter`, `DELETE /api/newsletter/{id}`.
- **Notifications:** `GET /api/notifications` (auth, last 50 with `->with(['actionBy:id,name,avatar','blog:id,title'])`). `GET /api/notifications/unread-count`. `PATCH /api/notifications/{id}/read`. `PATCH /api/notifications/mark-all-read`. `DELETE /api/notifications/{id}`.

**Commit:** `feat(api): contact + newsletter (log-only) + notifications`

---

#### **Step 16 — Comment reports API**

- `POST /api/comment-reports` (auth) — body `{ comment_id, reason, description? }`. Enforce `UNIQUE(comment_id, reported_by)` at the DB level; on collision return 409.
- `GET /api/comment-reports` (admin).
- `PATCH /api/comment-reports/{id}/status` (admin).
- `DELETE /api/comment-reports/{id}` (admin).
- `DELETE /api/comment-reports/{id}/comment` (admin) — deletes the offending comment; the report row is deleted by cascade.

**Commit:** `feat(api): comment reports (submit + moderate)`

---

### PHASE C — Seeder with dummy data

---

#### **Step 17 — Factories + `DatabaseSeeder` for one-command setup**

**Concept:** Laravel factories, the Faker library, and how `DatabaseSeeder::run()` drives `php artisan migrate:fresh --seed`.

**Instructions:**
1. Create factories for `User` (already exists — extend), `Category`, `Blog`, `Comment`:
   - `UserFactory`: add `state('admin')` returning `['is_super_user' => true, 'status' => 'active', 'name' => 'Admin', 'email' => 'admin@blog.local', 'password' => Hash::make('Admin@123')]`. Add `state('active')` → `['status' => 'active']`.
   - `CategoryFactory`: `name` = `fake()->unique()->words(2, true)`, `slug` = `Str::slug($attr['name'])`, `image` = `"https://picsum.photos/seed/{$this->faker->uuid}/400/300"`.
   - `BlogFactory`: `title` = 5-word sentence, `content` = 10 paragraphs of markdown, `blog_pic_url` = picsum, `author_name` = random user's name, `time_read` = `"{$n} mins read"`, `category_id` = `Category::inRandomOrder()->first()->id ?? Category::factory()`, `submitted_by` similarly.
   - `CommentFactory`: `text` = 2 sentences, `user_id` = random user, `blog_id` set by seeder.
2. In `database/seeders/DatabaseSeeder.php`:
   ```php
   public function run(): void
   {
       User::factory()->admin()->create();
       User::factory(10)->active()->create();
       User::factory(2)->create(['status' => 'pending']);

       Category::factory(10)->create();
       Blog::factory(30)->create();
       Blog::inRandomOrder()->take(5)->update(['is_featured' => true]);
       Blog::inRandomOrder()->take(5)->update(['is_popular'  => true]);

       Blog::all()->each(fn($b) => Comment::factory(rand(3,6))->create(['blog_id' => $b->id]));

       SiteSetting::firstOrCreate([], [
           'site_title'    => 'Blog Platform',
           'hero_title'    => 'Thoughts Meet Words',
           'hero_subtitle' => 'A space for student writers to share stories.',
           'footer_text'   => 'Built for young writers.',
           'social_links'  => ['twitter'=>'','linkedin'=>'','instagram'=>''],
           'about_page'    => ['name'=>'Admin','bio'=>'Founder'],
           'contact_page'  => ['heading'=>'Contact Us','email1'=>'admin@blog.local'],
       ]);
   }
   ```
3. Run `php artisan migrate:fresh --seed`. Should complete cleanly.
4. Verify: `GET /api/blogs` returns 30 blogs; `GET /api/blogs/featured` returns 5; log in as `admin@blog.local` / `Admin@123` and `GET /api/admin/users/pending` returns 2 users.

**Commit:** `feat(seed): factories + DatabaseSeeder for one-command dummy data setup`

---

### PHASE D — Next.js frontend

---

#### **Step 18 — Scaffold Next.js + install dependencies + axios setup**

**Concept:** Next.js 14 App Router, route groups, `NEXT_PUBLIC_*` env vars, axios interceptors for token injection and global error handling.

**Instructions:**
1. From the parent directory: `npx create-next-app@latest blog-frontend --js --tailwind --app --src-dir=false --import-alias "@/*"`. Say **no** to ESLint prompts if it hangs — you can add ESLint after.
2. `cd blog-frontend`. Install dependencies:
   ```bash
   npm install @mantine/core @mantine/hooks @mantine/form @mantine/dates @mantine/modals @mantine/carousel @mantine/notifications \
               @tabler/icons-react @tanstack/react-query @tanstack/react-query-devtools axios sonner \
               @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-underline \
               dayjs lodash nextjs-toploader dompurify
   npm install -D postcss-preset-mantine postcss-simple-vars
   ```
3. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```
   Also add a `.env.example` with the same key.
4. Create `utilities/axios.js`:
   ```js
   import axios from 'axios';
   import { toast } from 'sonner';

   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

   export const publicAxios = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });
   export const axiosPrivate = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

   axiosPrivate.interceptors.request.use((config) => {
     if (typeof window !== 'undefined') {
       const token = JSON.parse(localStorage.getItem('token') || 'null');
       if (token) config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   const handleError = (error) => {
     if (typeof window === 'undefined') return Promise.reject(error);
     const status = error?.response?.status;
     const message = error?.response?.data?.message;
     const onLogin = window.location.pathname === '/login';
     if (status === 401 || (status === 403 && !onLogin)) {
       localStorage.removeItem('token');
       localStorage.removeItem('isLoggedIn');
       toast.error(message || 'Session expired');
       window.location.href = '/login';
     } else if (status >= 500) toast.error(message || 'Server error');
     else if (status >= 400) toast.error(message || 'Something went wrong');
     return Promise.reject(error);
   };

   publicAxios.interceptors.response.use(r => r, handleError);
   axiosPrivate.interceptors.response.use(r => r, handleError);

   export default publicAxios;
   ```
5. Update `postcss.config.js` to include `postcss-preset-mantine` and `postcss-simple-vars`.
6. `npm run dev` — verify default page loads at `http://localhost:3000`.

**Commit:** `chore: bootstrap Next.js 14 with Mantine, Tailwind, React Query, TipTap, axios`

---

#### **Step 19 — Providers (Mantine + React Query + Toaster) and auth hook**

**Concept:** Provider composition in the root `app/layout.jsx`; a custom `useAuth` hook backed by `localStorage` + React Query.

**Instructions:**
1. Create `components/providers/QueryProvider.jsx`:
   ```jsx
   'use client';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { useState } from 'react';
   export function QueryProvider({ children }) {
     const [client] = useState(() => new QueryClient({
       defaultOptions: { queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false, retry: 1 } }
     }));
     return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
   }
   ```
2. Create `hooks/useAuth.js`:
   ```js
   'use client';
   import { useQuery } from '@tanstack/react-query';
   import { useLocalStorage } from '@mantine/hooks';
   import { useEffect, useState, useCallback } from 'react';
   import { useRouter } from 'next/navigation';
   import { axiosPrivate } from '@/utilities/axios';

   export default function useAuth() {
     const router = useRouter();
     const [hydrated, setHydrated] = useState(false);
     const [token, setToken] = useLocalStorage({ key: 'token', defaultValue: null });
     const [isLoggedIn, setIsLoggedIn] = useLocalStorage({ key: 'isLoggedIn', defaultValue: false });
     useEffect(() => setHydrated(true), []);

     const { data: user, isLoading, refetch } = useQuery({
       queryKey: ['currentUser'],
       queryFn: () => axiosPrivate.get('/auth/me').then(r => r.data),
       enabled: hydrated && !!token && isLoggedIn,
       staleTime: 5 * 60 * 1000,
       retry: false,
     });

     const logout = useCallback(async () => {
       try { await axiosPrivate.post('/auth/logout'); } catch {}
       setToken(null); setIsLoggedIn(false);
       router.push('/');
     }, [setToken, setIsLoggedIn, router]);

     return { user, token, isLoggedIn: hydrated ? isLoggedIn : false, isLoading, isAdmin: !!user?.is_super_user, logout, refetch };
   }
   ```
3. Create `app/layout.jsx` (root layout with all providers):
   ```jsx
   import '@mantine/core/styles.css';
   import { Inter } from 'next/font/google';
   import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
   import { ModalsProvider } from '@mantine/modals';
   import { QueryProvider } from '@/components/providers/QueryProvider';
   import { Toaster } from 'sonner';
   import NextTopLoader from 'nextjs-toploader';
   import './globals.css';

   const inter = Inter({ subsets: ['latin'], weight: ['400','500','600','700'] });
   const theme = createTheme({ primaryColor: 'cyan', defaultRadius: 'md', fontFamily: 'Inter, sans-serif' });

   export const metadata = { title: 'Blog Platform', description: 'A platform for young writers' };

   export default function RootLayout({ children }) {
     return (
       <html lang="en" className={inter.className}>
         <head><ColorSchemeScript defaultColorScheme="dark" /></head>
         <body>
           <MantineProvider theme={theme} defaultColorScheme="dark">
             <ModalsProvider>
               <QueryProvider>
                 <NextTopLoader color="#00e5ff" showSpinner={false} height={3} />
                 <Toaster position="top-center" richColors theme="dark" />
                 {children}
               </QueryProvider>
             </ModalsProvider>
           </MantineProvider>
         </body>
       </html>
     );
   }
   ```
4. Verify: `npm run dev`, page still loads with the Mantine styles applied.

**Commit:** `feat(frontend): providers (Mantine, React Query, sonner) + useAuth hook`

---

#### **Step 20 — Public layout (Navbar, Footer, theme toggle) + route groups**

**Concept:** App Router route groups `(user)` and `(admin)` for grouping without affecting URLs; a shared Navbar; a theme toggle using Mantine's `useMantineColorScheme`.

**Instructions:**
1. Restructure `app/` — move `page.jsx` (default) into `app/(user)/page.jsx`. Create `app/(user)/layout.jsx` that renders `<Navbar />{children}<Footer />` (no new `<html>`, since the root layout owns it).
2. Create `components/Header/Navbar.jsx` (client) with:
   - Logo linking to `/`.
   - Nav links: Home, Blogs, About, Contact, plus Login / Register when logged out; My Blogs, Favourites, Profile, Notifications bell, Logout when logged in; extra "Admin" link when `useAuth().isAdmin`.
   - Mobile burger via Mantine `Burger`.
3. Create `components/Header/ThemeToggle.jsx` using `useMantineColorScheme`.
4. Create `components/Footer/Footer.jsx` — reads `useQuery(['siteSettings'], fetchSiteSettings)` and renders footer text + social links.
5. Create `api/siteSettings.mjs` with `getSiteSettings()` calling `GET /settings`.
6. Verify: navbar shows on all pages; theme toggle swaps light/dark.

**Commit:** `feat(frontend): navbar, footer, theme toggle, route groups (user)`

---

#### **Step 21 — Auth pages: register (pending-approval flow) + login**

**Concept:** Single-step registration ending on a "pending approval" screen (no OTP); login that shows a specific error when the API returns 403 with `pending` or `banned`.

**Instructions:**
1. `app/(user)/register/page.jsx`:
   - Mantine `useForm` with `name`, `email`, `password`, `password_confirmation` (validators: name min 3, valid email, password min 8, match).
   - Submit → `POST /auth/register`.
   - On success, switch to a green "Your account is awaiting admin approval." screen with a "Back to login" button.
2. `app/(user)/login/page.jsx`:
   - Mantine form with email + password + "Remember me" (checkbox not used by API — kept for UX consistency).
   - Submit → `POST /auth/login`.
   - On success, store `token` and `isLoggedIn` in localStorage, redirect: if `user.is_super_user` → `/admin`, else `/`.
   - On 403, extract the message from the error response and display it as a Mantine `Alert` above the form.
   - Auto-redirect if already logged in (call `useAuth`).
3. `api/auth.mjs`: `loginUser({ email, password })`, `registerUser(payload)`, `logoutUser()`.

**Commit:** `feat(auth): register (pending-approval) + login with clear rejection messages`

---

#### **Step 22 — Home page (hero, categories, featured blogs, recent blogs)**

**Instructions:**
1. `app/(user)/page.jsx`:
   ```jsx
   import Hero from '@/components/Hero/Hero';
   import Categories from '@/components/Categories/Categories';
   import FeaturedBlog from '@/components/FeaturedBlog/FeaturedBlog';
   import RecentBlog from '@/components/RecentPost/RecentBlog';
   export default function Home() { return (<><Hero /><Categories /><FeaturedBlog /><RecentBlog /></>); }
   ```
2. `Hero/Hero.jsx` — uses `useQuery(['siteSettings'])`, renders `hero_title`, `hero_subtitle`, a Subscribe form (posts to `/newsletter`), and (as a fun touch) the daily quote from `/api/quote`.
3. `Categories/Categories.jsx` — Mantine carousel with autoplay 3s, item shows category image + name + blog count. `useQuery(['blogs','all'])` for the count, `useQuery(['siteSettings'])` for the list.
4. `FeaturedBlog/FeaturedBlog.jsx` — grid: `useQuery(['blogs','featured'])`, first two blogs get a 2-column card, the rest fill single columns.
5. `RecentPost/RecentBlog.jsx` — vertical list, `useQuery(['blogs','recent'])`.
6. Each blog card has an "Open post" link → `/blogs/[id]`.

**Commit:** `feat(home): hero, categories carousel, featured & recent blog sections`

---

#### **Step 23 — Blog listing + blog detail (comments, likes, favorites, reports)**

**Instructions:**
1. `app/(user)/blogs/page.jsx` — grid with:
   - Mantine `TextInput` for search, `Select` for category filter, `SegmentedControl` for sort, `Pagination`.
   - `useQuery(['blogs', { page, per_page, search, category, sort, order }], ...)`.
2. `app/(user)/blogs/[id]/page.jsx`:
   - `useQuery(['blog', id], () => getBlog(id))`.
   - Renders title, hero image, author info, sanitised HTML via `DOMPurify.sanitize(blog.content)`, publish date, read time.
   - Below: `LikeButton`, `FavoriteButton`, a comment form (auth-only), a threaded comment list.
   - Comments: top-level list; each shows a "Reply" toggle that opens a nested comment form (`parent_id`). Include a "Report" menu on each comment (open a Mantine modal with the reason enum).
3. `components/FavoriteButton.jsx` — optimistic update with rollback on error.
4. `components/LikeButton.jsx` — same pattern.
5. `hooks/mutations/useCommentMutation.js` — addComment, updateComment, deleteComment, reportComment.

**Commit:** `feat(blogs): listing with filters + detail with comments/likes/favorites/reports`

---

#### **Step 24 — Authenticated user pages (Favourites, Profile, My Blogs, My Requests, Request Blog)**

**Instructions:**
1. Create `components/RequireAuth.jsx` — client wrapper that reads localStorage token, redirects to `/login` if missing, shows a Loader while checking.
2. Pages under `app/(user)/` wrapped in `<RequireAuth>`:
   - `favourites/page.jsx` — `useQuery(['favorites'])`, blog card grid, unfavorite button.
   - `profile/page.jsx` — Mantine form for name + avatar `FileInput`. Compress the image client-side with a canvas helper (create `utils/compressImage.js`), then submit as `FormData` to `PATCH /users/me`.
   - `my-blogs/page.jsx` — `useQuery(['blogs','mine'])`.
   - `my-requests/page.jsx` — `useQuery(['blog-requests','mine'])`, status badges.
   - `request-blog/page.jsx` — form with title, category select, rich text editor (see Step 26 for the editor component — reusable), image upload. Submits multipart to `POST /blog-requests`.
3. Add a `NotificationBell` component in the Navbar: `useQuery(['notifications','unread-count'], refetchInterval: 30_000)`, popover with the list from `useQuery(['notifications'])`.

**Commit:** `feat(user): favourites, profile, my-blogs, my-requests, request-blog + notifications bell`

---

#### **Step 25 — Admin layout + guard + sidebar navigation**

**Instructions:**
1. `app/(admin)/admin/layout.jsx` — client layout containing an `AdminGuard` component that:
   - Reads `token` from localStorage.
   - Calls `GET /auth/me`; if response.is_super_user is true, renders children; else redirects.
   - Shows a Mantine Loader while checking.
2. Wraps children in a two-column layout: sidebar + main. Sidebar links (each is a Next.js `<Link>`):
   - All Blogs, Create Blog, **Pending Users** (with a red badge showing pending count — `useQuery(['admin','pendingCount'])`), Manage Users, Manage Categories, Blog Requests, Comment Reports, Contact Messages, Newsletter, Customize Hero, Customize About, Customize Contact, Customize Footer.
3. No `<Navbar />` / `<Footer />` inside admin — dedicated admin chrome only.

**Commit:** `feat(admin): guarded layout + sidebar navigation`

---

#### **Step 26 — Admin: All Blogs, Create Blog, Edit Blog (with TipTap rich text editor)**

**Instructions:**
1. `components/Editor/RichTextEditor.jsx` — TipTap editor with `StarterKit`, `Image.configure({ inline: false, allowBase64: false })`, `Link.configure({ openOnClick: false })`, `Placeholder`, `Underline`. Toolbar buttons: bold, italic, underline, strike, H1/H2/H3, bullet/ordered list, blockquote, code, link (via prompt), image (via prompt), undo/redo. Emits `editor.getHTML()`.
2. `app/(admin)/admin/all-blogs/page.jsx` — table of blogs with search + delete + toggle featured. Use Mantine `Table`; if `blogs.length > 50` render a virtualized version using `@tanstack/react-virtual` (optional polish).
3. `app/(admin)/admin/create-blog/page.jsx`:
   - Fields: title, category select, author name, author details, time_read, blog image, author avatar, featured toggle, RichTextEditor.
   - Submit as `FormData` to `POST /blogs`.
4. `app/(admin)/admin/edit-blog/[id]/page.jsx` — same form pre-filled from `GET /blogs/{id}`. Submit to `PUT /blogs/{id}`.
5. `hooks/mutations/useBlogAdminMutation.js` — invalidate `['blogs']`, `['blogs','featured']`, `['blogs','popular']` on success.

**Commit:** `feat(admin): all-blogs + create-blog + edit-blog with TipTap editor`

---

#### **Step 27 — Admin: Pending Users, Manage Users, Manage Categories**

**Instructions:**
1. `app/(admin)/admin/pending-users/page.jsx`:
   - `useQuery(['admin','pendingUsers'])` → table with name, email, registered_at, Approve button, Delete button.
   - Approve → `POST /admin/users/{id}/approve` → invalidate `['admin','pendingUsers']` and `['admin','pendingCount']`.
   - Delete → `DELETE /admin/users/{id}` with a confirmation modal.
2. `app/(admin)/admin/manage-users/page.jsx`:
   - Paginated list of all users, search by name/email, filter by status.
   - Ban/unban toggle, delete with cascade warning.
3. `app/(admin)/admin/manage-categories/page.jsx`:
   - Add category form (name + image upload).
   - Table of existing categories with rename + delete. Delete shows a warning if blogs are using it (server returns 409).

**Commit:** `feat(admin): pending-users approval queue + user management + category management`

---

#### **Step 28 — Admin: Blog Requests, Comment Reports, Contact Messages, Newsletter**

**Instructions:**
1. `blog-requests/page.jsx` — table of all requests. Actions: Preview (modal with content), Edit (goes to a request edit form), Approve (creates a Blog), Reject (with note textarea), Delete.
2. `comment-reports/page.jsx` — table with reporter, reason, description, status. Actions: mark reviewed / dismissed, delete report, delete offending comment.
3. `contact-messages/page.jsx` — inbox-style list. Actions: mark read, delete. Unread items visually distinct.
4. `newsletter/page.jsx` — table of subscribers with delete.

**Commit:** `feat(admin): blog requests, comment reports, contact inbox, newsletter admin`

---

#### **Step 29 — Admin: Site customization (Hero, About, Contact, Footer)**

**Instructions:**
1. `customize-hero/page.jsx` — Mantine form with `hero_title`, `hero_subtitle`, `site_title`, site logo upload. Submits to `PUT /settings` (and `PUT /settings/site-logo` for the logo file).
2. `customize-about/page.jsx` — form for `about_page` JSON: name, bio (Textarea), image upload (`PUT /settings/about-image`), roles list (repeater — array of `{ title, organization }`), social links (LinkedIn, Twitter, Facebook, email).
3. `customize-contact/page.jsx` — form for `contact_page` JSON: heading, description, phone1/2, email1/2, address1/2, map embed URL, form heading, form description.
4. `customize-footer/page.jsx` — form for `footer_text` and `social_links` (Twitter/LinkedIn/Instagram).

**Commit:** `feat(admin): site customization for hero, about, contact, footer`

---

### PHASE E — Wrap up

---

#### **Step 30 — README + `.env.example` + polish**

Copy the "Local Setup" section below into both `blog-backend/README.md` and `blog-frontend/README.md` (each with the parts relevant to that project). Commit `.env.example` files in both projects with scrubbed values. Add a `TROUBLESHOOTING.md` if you like, or fold that content into the README.

**Commit:** `docs: README, .env.example, local setup instructions`

---

## Verification

Once every step is done, run through this checklist end-to-end:

1. `php artisan migrate:fresh --seed` in `blog-backend/` completes with no errors and populates all tables. Verify with `mysql> SELECT COUNT(*) FROM blogs;` (expect 30), `SELECT COUNT(*) FROM users;` (expect 13).
2. Start both servers: `php artisan serve` (port 8000) and `npm run dev` (port 3000).
3. **Frontend smoke test:**
   - Register a new user at `http://localhost:3000/register` → see the "awaiting approval" screen.
   - Log in as the seeded admin (`admin@blog.local` / `Admin@123`) → navigate to `/admin/pending-users` → approve the new user.
   - Log out, log in as the newly-approved user → success. Browse `/blogs`, open one, comment, reply, like, favorite, report a comment — every action persists after refresh.
4. **Backend Blade smoke test:**
   - Visit `http://localhost:8000/login`, log in with the admin account.
   - `/dashboard/overview` shows stats + AJAX-loaded latest blogs and quote of the day (check DevTools → Network for two XHRs).
   - `curl http://localhost:8000/dashboard/overview -H 'X-Country: US'` returns 403 → **proves the `country:BD` middleware**.
   - Visit `/blogs`, create → edit → delete a blog → **proves resource CRUD + CSRF + method spoofing**.
5. **Lab-checklist self-check:** open the backend and confirm each of the 9 requirements is visible in code.

---

## Local Setup — How to run the project on any machine after `git clone`

Assumes **XAMPP / Laragon / native** with PHP 8.2+, Composer 2, MySQL 8, Node 20+ installed.

### Backend (Laravel)

```bash
cd blog-backend

# 1. Install PHP dependencies
composer install

# 2. Copy env and generate the app key
cp .env.example .env
php artisan key:generate

# 3. Create the database (XAMPP: phpMyAdmin → New database → 'blog')
mysql -u root -e "CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Edit .env — set DB_DATABASE=blog and your DB_USERNAME / DB_PASSWORD

# 5. Migrations + dummy data (one command)
php artisan migrate:fresh --seed

# 6. Publicly serve uploaded images
php artisan storage:link

# 7. Build Breeze's Blade CSS (only for the Blade admin dashboard)
npm install
npm run build

# 8. Serve
php artisan serve
# → http://localhost:8000
```

**Seeded admin credentials:** `admin@blog.local` / `Admin@123`

### Frontend (Next.js)

```bash
cd blog-frontend

# 1. Install Node dependencies
npm install

# 2. Point at the local Laravel API
cp .env.example .env.local
# Ensure .env.local contains:
#   NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 3. Dev server
npm run dev
# → http://localhost:3000
```

Sign in on `http://localhost:3000/login` with the seeded admin credentials to reach the admin panel.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `SQLSTATE[HY000] [2002]` on migrate | MySQL not running. Start it in XAMPP / Laragon. |
| Images 404 | Forgot `php artisan storage:link`. |
| Register button hangs / CORS error | Check `config/cors.php` — allow `http://localhost:3000`. In Laravel 11 that's the `paths` array in `config/cors.php`; ensure `paths` includes `api/*` and `allowed_origins` includes your frontend URL. |
| Login returns 403 for the seeded admin | Seeder didn't run or admin's status is `pending`. Re-run `php artisan migrate:fresh --seed`. |
| Next.js shows "session expired" repeatedly | `NEXT_PUBLIC_API_URL` is wrong or Laravel isn't running on 8000. Restart `npm run dev` after editing `.env.local`. |
| `country:BD` middleware blocks you | Send `X-Country: BD` header or omit the header — the middleware defaults to `config('app.default_country', 'BD')`. |
| `php artisan install:api` errors on old Laravel | Requires Laravel 11+. If on 10, install Sanctum manually: `composer require laravel/sanctum && php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" && php artisan migrate`. |

---

## Summary of what each phase gives you

- **Phase A (Steps 1–8)** — a working Laravel app that satisfies every item on the lab checklist. If you had to stop here, you'd already have a demoable project.
- **Phase B (Steps 9–16)** — the JSON API the Next.js frontend will talk to.
- **Phase C (Step 17)** — one-command DB setup on any machine.
- **Phase D (Steps 18–29)** — the Next.js frontend, built from scratch.
- **Phase E (Step 30)** — README + env examples so anyone can clone and run in five minutes.
