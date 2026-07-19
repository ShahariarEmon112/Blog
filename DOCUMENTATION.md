# ClassRoom Writes — Full Documentation

## Table of Contents

1. [What This Is](#what-this-is)
2. [Architecture](#architecture)
3. [Backend Deep Dive](#backend-deep-dive)
4. [Frontend Deep Dive](#frontend-deep-dive)
5. [Auth Flow](#auth-flow)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Seeder Data & Testing](#seeder-data--testing)
9. [Common Gotchas](#common-gotchas)

---

## What This Is

ClassRoom Writes started as a personal project — I wanted a place where students in my circle could write blogs, share ideas, and actually interact with each other without the noise of big social media. It grew into something bigger: a full-stack blog platform with friends, messages, notifications, and an admin panel to keep things clean.

The whole thing runs on two separate apps — a Laravel backend that serves JSON APIs, and a Next.js frontend that talks to it. No Blade templates, no Inertia, just a straight API-driven setup.

---

## Architecture

```
Browser  ←→  Next.js (port 3000)  ←→  Laravel API (port 8000)  ←→  MySQL
                 ↑                              ↑
            React Query cache           Sanctum token auth
```

The frontend calls the backend directly (no Next.js API proxy). CORS is configured on the Laravel side to allow requests from `localhost:3000`.

**Key design decisions:**

- **No email system.** No password reset, no email verification, no welcome emails. Users register and sit in "pending" until an admin activates them.
- **Sanctum over JWT.** Simple token-based auth, no refresh token complexity. Tokens live in localStorage.
- **React Query for caching.** Stale data gets cleared on every login/logout via a custom event. Prevents one user from seeing another user's cached data.
- **`_method` spoofing for uploads.** PHP doesn't populate `$_FILES` on PATCH/PUT requests, so file uploads (profile avatar, blog images) go through POST with `_method=PUT`.

---

## Backend Deep Dive

### Tech

Laravel 13, Sanctum 4, MySQL, Guzzle 7

### Directory Layout

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php            # register, login, logout, me, updateProfile
│   │   ├── BlogController.php            # public + admin blog CRUD
│   │   ├── BlogRequestController.php     # blog request submit, approve, reject
│   │   ├── CategoryController.php        # public index + admin CRUD
│   │   ├── CommentController.php         # create, update, delete comments
│   │   ├── CommentReportController.php   # report, admin list, update status, delete
│   │   ├── ContactController.php         # submit contact, admin list/read/reply
│   │   ├── FavoriteController.php        # add/remove/check favorites
│   │   ├── FriendRequestController.php   # send/accept/reject, list friends, discover users
│   │   ├── LikeController.php            # like/unlike blogs
│   │   ├── MessageController.php         # send/reply, inbox/sent, conversation, users
│   │   ├── NewsletterController.php      # subscribe, admin list/delete
│   │   ├── NotificationController.php    # list, mark read, delete, mark all read
│   │   ├── SiteSettingController.php     # get/update site settings
│   │   └── Admin/UserController.php      # list, approve, ban, delete users
│   └── Middleware/
│       └── AdminMiddleware.php           # checks is_super_user
├── Models/
│   ├── User.php                          # friends(), sentRequests(), receivedRequests()
│   ├── Blog.php                          # belongsTo Category, User
│   ├── BlogRequest.php
│   ├── Category.php
│   ├── Comment.php
│   ├── CommentReport.php
│   ├── Contact.php
│   ├── Favorite.php
│   ├── FriendRequest.php                 # sender/receiver scopes
│   ├── Like.php
│   ├── Message.php                       # sender/receiver/parent/replies
│   ├── NewsletterSubscriber.php
│   ├── AppNotification.php
│   └── SiteSetting.php
└── Services/
    └── QuoteService.php                  # fetches from zenquotes.io, cached hourly
```

### Models & Relationships

**User** is the central model. It has:
- `friends()` — returns accepted friend connections (user IDs of both sides)
- `sentRequests()` / `receivedRequests()` — FriendRequest relationships
- `blogs()`, `comments()`, `likes()`, `favorites()` — content relationships
- `notifications()` — received AppNotifications

**Blog** belongs to Category and User (submitted_by). Has `comments()`, `likes()`, `favorites()`.

**Message** has sender/receiver (both User), threaded via `parent_id` (self-referential). A parent message's replies are fetched via `replies()`.

**FriendRequest** has sender/receiver (both User), status enum: `pending/accepted/rejected`.

**AppNotification** has recipient/actionBy (both User), type enum: `welcome/blog_posted/friend_request/friend_accepted/comment/like/request_approved`.

### Middleware

**AdminMiddleware** — checks if authenticated user has `is_super_user = true`. Used on all `/api/admin/*` routes. Returns 403 if not admin.

### Routes (api.php)

**Auth (public)**
- `POST /auth/register` — creates user with status `pending`
- `POST /auth/login` — accepts `login` (email or user ID) + `password`, returns Sanctum token

**Auth (authenticated)**
- `POST /auth/logout`, `GET /auth/me`, `PATCH /users/me`

**Content (public)**
- `GET /blogs`, `/blogs/featured`, `/blogs/popular`, `/blogs/category/{slug}`, `/blogs/{blog}`
- `GET /categories`, `/site-settings`, `/quote`

**Content (authenticated)**
- Blog comments CRUD, like/unlike, favorites, blog requests
- Friend requests (send/accept/reject, incoming/outgoing, friends list, discover users, remove)
- Messages (send, reply, inbox, sent, conversation, unread-count, users list)
- Notifications (list, read, delete, mark-all-read)
- Comment reports (submit)

**Admin (`/api/admin/*`)**
- Blogs CRUD + toggle featured
- Users (list, pending, approve, ban, delete)
- Blog requests (list, approve, reject, update, delete)
- Categories full CRUD
- Site settings (show, update)
- Contact messages (list, mark read, delete, reply)
- Newsletter (list, delete)
- Comment reports (list, update status, delete, delete comment)

### Friend System Notes

`GET /friends` returns users who have an accepted FriendRequest with the current user (in either direction). No directionality — if A is friends with B, both see each other.

`GET /users/all` returns all active users except the current user, with `is_friend` flag.

### Message System Notes

- Inbox returns top-level messages (parent_id IS NULL) where current user is the receiver
- Sent returns top-level messages where current user is the sender
- Conversation fetches the parent message + all replies, checks user is a participant
- `GET /message-users` returns all active users with an `is_friend` flag. Friends sorted first.
- Admin contact reply creates a Message from admin to the contact's user_id (if registered)

---

## Frontend Deep Dive

### Tech

Next.js 16 (App Router), Mantine 9, Tailwind CSS 4, React Query 5, TipTap 3, Axios, Dayjs, Sonner, Tabler Icons

### Pages & Routes

**Public (no auth needed):**
- `/` — Homepage with hero, featured blogs, popular blogs, quote of the day
- `/blogs/{id}` — Blog detail with comments, likes, favorites
- `/categories` — Browse blogs by category
- `/about` — Founder story
- `/contact` — Contact form
- `/register` — New user registration
- `/login` — Login (by email or user ID)

**User pages (auth required):**
- `/profile` — View/edit profile, avatar upload
- `/my-blogs` — Own blog posts
- `/request-blog` — Submit a blog request
- `/my-requests` — Track submitted requests
- `/favourites` — Blog bookmarks
- `/friends` — 4 tabs: My Friends, Incoming, Sent, Discover
- `/messages` — Inbox/Sent tabs, compose modal, threaded conversation view
- `/notifications` — Notification list with mark-read

**Admin pages (super_user only):**
- `/admin` — Dashboard overview
- `/admin/all-blogs` — Manage all blogs
- `/admin/manage-users` — All users management
- `/admin/pending-users` — Approve/reject pending users
- `/admin/blog-requests` — Approve/reject blog requests
- `/admin/manage-categories` — CRUD categories
- `/admin/contact-messages` — Contact form submissions with reply
- `/admin/comment-reports` — Review reported comments
- `/admin/newsletter` — Newsletter subscriber list
- `/admin/site-settings` — Update hero, about, contact, social links

### Key Components

- **Header/Navbar** — Desktop dropdown + mobile drawer with conditional links for auth/admin
- **NotificationBell** — Dropdown with unread count, click-to-navigate, mark-read, delete
- **RequireAuth** — Wraps pages to redirect unauthenticated users to login
- **AdminGuard** — Wraps admin pages, redirects non-admins
- **FavoriteButton/LikeButton** — Optimistic UI updates via React Query cache

### Auth Flow

1. User logs in → token stored in localStorage under `token` key
2. `axiosPrivate` interceptor reads token from localStorage and attaches `Authorization: Bearer {token}`
3. `useAuth` hook fetches `/auth/me` using the token, exposes `user`, `isLoggedIn`, `isAdmin`, `logout`
4. On login: `clear-query-cache` event fires → QueryProvider clears all cached queries
5. On logout: same event fires, token deleted from localStorage
6. On 401 response: interceptor wipes token and redirects to `/login`
7. On 403 response: no logout (fixed — was previously logging out on any 403)

### API Layer

Each feature has its own file under `api/`:

- `auth.mjs` — login, register, logout
- `blogs.mjs` — all blog CRUD, admin blog endpoints
- `categories.mjs` — category CRUD
- `friends.mjs` — friend request operations
- `messages.mjs` — messaging + contact reply
- `notifications.mjs` — notification CRUD
- `admin.mjs` — admin-specific endpoints (users, requests, reports, settings)

### Styling

- Mantine components with `useMantineColorScheme` for dark/light mode support
- Tailwind for utility classes where needed
- Color scheme-aware backgrounds in modals (`.0` lightness for light, `dark.*` for dark)

---

## Database Schema

23 migrations total. Key tables:

**users** — id, name, email, password, is_super_user, status (active/pending/banned), avatar, age, gmail, education_status

**blogs** — id, title, content (longtext), blog_pic_url, author_name, author_details, time_read, category_id, submitted_by, is_featured, is_popular, likes_count

**categories** — id, name, slug (unique)

**comments** — id, blog_id, user_id, text, is_anonymous

**likes** — blog_id, user_id (unique pair)

**favorites** — blog_id, user_id (unique pair)

**blog_requests** — id, title, content, category_id, submitted_by, status, admin_note, time_read, author_name, author_details

**friend_requests** — id, sender_id, receiver_id, status (pending/accepted/rejected), unique(sender_id, receiver_id)

**messages** — id, sender_id, receiver_id, subject, body, parent_id (nullable, self-referential), read (boolean)

**app_notifications** — id, recipient_id, action_by_id, type (enum: welcome/blog_posted/friend_request/friend_accepted/comment/like/request_approved), blog_id (nullable), friend_request_id (nullable)

**comment_reports** — id, comment_id, reported_by, reason (enum: spam/harassment/inappropriate/misinformation/other), status

**contacts** — id, name, email, subject, message, user_id (nullable), replied (boolean), is_read (boolean)

**site_settings** — id, site_title, hero_title, hero_subtitle, footer_text, social_links (JSON), about_page (JSON), contact_page (JSON), site_logo

**newsletter_subscribers** — id, name, email (unique)

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register (status = pending) |
| POST | `/api/auth/login` | No | Login by email or ID → token + user |
| POST | `/api/auth/logout` | Yes | Revoke current token |
| GET | `/api/auth/me` | Yes | Current user info |
| PATCH | `/api/users/me` | Yes | Update profile (name, avatar, age, etc.) |

### Blogs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/blogs` | No | Paginated blog list |
| GET | `/api/blogs/featured` | No | Featured blogs |
| GET | `/api/blogs/popular` | No | Popular blogs |
| GET | `/api/blogs/category/{slug}` | No | Blogs by category |
| GET | `/api/blogs/{blog}` | No | Single blog with comments |
| GET | `/api/blogs/mine` | Yes | Current user's blogs |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/blogs/{blog}/comments` | Yes | Create comment |
| PATCH | `/api/comments/{comment}` | Yes | Update own comment |
| DELETE | `/api/comments/{comment}` | Yes | Delete own comment |

### Likes & Favorites

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST/DELETE | `/api/blogs/{blog}/like` | Yes | Toggle like |
| GET/POST/DELETE | `/api/favorites/*` | Yes | Toggle/bookmark favorites |

### Friends

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/friend-requests` | Yes | Send request |
| PATCH | `/api/friend-requests/{id}/accept` | Yes | Accept incoming |
| PATCH | `/api/friend-requests/{id}/reject` | Yes | Reject incoming |
| GET | `/api/friend-requests/incoming` | Yes | Pending received |
| GET | `/api/friend-requests/outgoing` | Yes | Pending sent |
| GET | `/api/friends` | Yes | Accepted friends |
| GET | `/api/users/all` | Yes | Discover users (with is_friend) |
| DELETE | `/api/friends/{user}` | Yes | Remove friend |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/messages` | Yes | Send message |
| POST | `/api/messages/{id}/reply` | Yes | Reply to thread |
| GET | `/api/messages/inbox` | Yes | Received messages (top-level) |
| GET | `/api/messages/sent` | Yes | Sent messages (top-level) |
| GET | `/api/messages/{id}` | Yes | Thread (parent + replies), 403 if not participant |
| GET | `/api/messages/unread-count` | Yes | Unread count |
| PATCH | `/api/messages/{id}/read` | Yes | Mark as read |
| GET | `/api/message-users` | Yes | Users list with is_friend flag |

### Admin Endpoints

All under `/api/admin/*`, require auth + admin middleware:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/blogs` | All blogs |
| POST | `/admin/blogs` | Create blog (notifies friends) |
| PUT | `/admin/blogs/{id}` | Update blog |
| DELETE | `/admin/blogs/{id}` | Delete blog |
| PATCH | `/admin/blogs/{id}/featured` | Toggle featured |
| GET | `/admin/users` | All users |
| GET | `/admin/users/pending` | Pending users |
| POST | `/admin/users/{id}/approve` | Activate user |
| PATCH | `/admin/users/{id}/ban` | Ban user |
| DELETE | `/admin/users/{id}` | Delete user |
| GET/POST/PUT/DELETE | `/admin/categories` | Category CRUD |
| GET | `/admin/blog-requests` | All requests |
| POST | `/admin/blog-requests/{id}/approve` | Approve + auto-publish |
| POST | `/admin/blog-requests/{id}/reject` | Reject with note |
| GET | `/admin/contact` | Contact messages |
| PATCH | `/admin/contact/{id}/read` | Mark read |
| DELETE | `/admin/contact/{id}` | Delete message |
| POST | `/admin/contact/{id}/reply` | Reply as internal message |
| GET | `/admin/comment-reports` | All reports |
| PATCH | `/admin/comment-reports/{id}/status` | Update status |
| DELETE | `/admin/comment-reports/{id}` | Delete report |
| DELETE | `/admin/comment-reports/{id}/comment` | Delete reported comment |
| GET | `/admin/newsletter` | Subscribers |
| DELETE | `/admin/newsletter/{id}` | Remove subscriber |
| GET/PUT | `/admin/site-settings` | Site configuration |

---

## Seeder Data & Testing

Run `php artisan migrate:fresh --seed` to reset everything.

The `DatabaseSeeder` creates:
- 1 admin, 10 active users, 2 pending users
- 10 categories, 30 factory blogs
- Comments on each blog (3-6 per blog)
- Friend connections (26 accepted, 4 pending) — `FriendConnectionSeeder`
- 8 message threads with replies — `TestMessagesSeeder`

Then `DemoDataSeeder` adds:
- 14 real student users (2 blogs each = 28 blogs)
- 8 blog requests (mix of statuses)
- 10 contact messages
- 25 blogs get comments (2-5 each)
- Likes on all blogs (2-8 random users per blog)
- 8 users get favorites
- 6 comment reports
- 6 newsletter subscriptions
- 6 welcome notifications
- Site settings with full content

### Test Credentials

Log in with email OR user ID. Passwords vary per user:

**Admin:**
- ID 1 — MD. Shahariar Emon Saikat — password: `Admin@123`

**Students (active) — password = firstname + roll:**
| ID | Name | Password |
|----|------|----------|
| 14 | Niyamul Kabir Sajid | `password` |
| 16 | Mahbubul Alam | `mahbubul2207002` |
| 17 | Rafsan Jani | `rafsan2207003` |
| 18 | Shahriar Prottoy | `shahriar2207005` |
| 19 | Rafsan Riasat | `rafsan2207006` |
| 20 | Fahim Hossen | `fahim2207007` |
| 21 | Mehedi Nibir | `mehedi2207012` |
| 22 | Redoanul Karim | `redoanul2207014` |
| 23 | Alif Al Ahad | `alif2207016` |
| 24 | Sazzath Rafee | `sazzath2207019` |
| 25 | Shah Makhdum Sharif | `shah2207089` |
| 26 | Rahi Sadat Ruhan | `rahi2207088` |
| 27 | Lionel Messi | `lionel2207122` |
| 28 | Neymar Junior | `neymar2207123` |
| 29 | Cristiano Ronaldo | `cristiano2207124` |
| 30 | Adib Raian | `adib2207020` |
| 31 | Sazzad Ahmed | `sazzad2207026` |
| 32 | Utsa Roy | `utsa2207027` |
| 33 | Manjar Hossain | `manjar2207029` |
| 34 | Ahmed Kaif | `ahmed2207025` |

**Factory users (IDs 2-11):** password `password`
**Pending users:** IDs 12, 13, 15 (password `password`), IDs 35-42 (password = firstname + roll as per table above)

---

## Common Gotchas

**1. File uploads fail silently**
PHP doesn't populate `$_FILES` on PATCH/PUT. The profile update and admin blog edit use `_method` spoofing (POST with `_method=PUT` field). If you're testing with curl/Postman, use POST with the spoof field.

**2. Admin sees empty messages page**
That's normal. The admin (ID 1) hasn't sent/received any messages. Only the seeded student users have conversations. If you log in as a student, you'll see messages.

**3. React Query shows stale data after switching users**
Fixed by the `clear-query-cache` event. The cache is wiped on every login and logout. If you're seeing someone else's data, do a hard refresh.

**4. 403 on every conversation click**
If you're logged in as admin and clicking messages in your inbox, and getting logged out — that was a bug in the axios interceptor. It previously cleared the token on any 403. Fixed now — only 401 triggers logout.

**5. Messages route not working**
Route ordering in `api.php` matters. `GET /messages/unread-count` must be defined before `GET /messages/{message}` or Laravel will match "unread-count" as a message ID. This was fixed.

**6. Avatar URLs**
Stored as either relative paths (storage/avatars/...) or absolute URLs (UI Avatars). The `getAvatarUrl()` utility checks for `http` prefix — if found, returns as-is; otherwise prepends `STORAGE_URL`.

**7. User status lifecycle**
`pending` → admin approves → `active`. If a pending user tries to log in, they get a 403 with "awaiting admin approval". Banned users get a different message.
