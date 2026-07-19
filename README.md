# ClassRoom Writes

A blog platform built for students, by students. Write, share, and interact with a community of young writers. No fancy stuff — just blogs, comments, likes, friends, and messages.

**Live demo:** Not deployed yet (runs locally)

---

## Tech Stack

**Frontend:** Next.js 16, Mantine 9, Tailwind CSS 4, React Query 5, TipTap editor, Axios, Sonner toasts

**Backend:** Laravel 13 (API only), Sanctum (auth), MySQL, Guzzle

---

## Features

- **Blog system** — Write blogs using TipTap editor, browse by categories, featured/popular sections
- **Blog requests** — Submit blog ideas to admins for approval before publishing
- **Comments** — Comment on blogs, edit/delete your own, report inappropriate ones
- **Likes & favorites** — Like blogs, bookmark them to read later
- **Friend system** — Search users, send/accept/reject friend requests, remove friends
- **Direct messages** — Message your friends (with threaded replies), compose new messages
- **Notifications** — Get notified on friend requests, blog posts from friends, request approvals
- **Admin panel** — Manage users (approve/ban), blogs, categories, blog requests, comment reports, contact messages, site settings, newsletter subscribers
- **Contact form** — Reach out to the team (guests and registered users both)
- **Newsletter** — Subscribe for updates
- **Quote of the day** — Fetched from ZenQuotes API, cached hourly

---

## Quick Start

### 1. Backend

```bash
cd blog-backend

# Copy env and configure DB
cp .env.example .env
# Edit .env — set DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Install & setup
composer install
php artisan key:generate
php artisan migrate --seed

# Start
php artisan serve
```

### 2. Frontend

```bash
cd blog-frontend

# Copy env
cp .env.example .env.local
# Edit .env.local — NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Install & run
npm install
npm run dev
```

### 3. Login

Log in with your email OR user ID:

| ID | Name | Password | Role |
|----|------|----------|------|
| 1 | MD. Shahariar Emon Saikat | `Admin@123` | Admin |
| 2-13 | Factory users (Roslyn, Madisyn, etc.) | `password` | Active |
| 14 | Niyamul Kabir Sajid | `password` | Active |
| 16 | Mahbubul Alam | `mahbubul2207002` | Active |
| 17 | Rafsan Jani | `rafsan2207003` | Active |
| 18 | Shahriar Prottoy | `shahriar2207005` | Active |
| 19 | Rafsan Riasat | `rafsan2207006` | Active |
| 20 | Fahim Hossen | `fahim2207007` | Active |
| 21 | Mehedi Nibir | `mehedi2207012` | Active |
| 22 | Redoanul Karim | `redoanul2207014` | Active |
| 23 | Alif Al Ahad | `alif2207016` | Active |
| 24 | Sazzath Rafee | `sazzath2207019` | Active |
| 25 | Shah Makhdum Sharif | `shah2207089` | Active |
| 26 | Rahi Sadat Ruhan | `rahi2207088` | Active |
| 27 | Lionel Messi | `lionel2207122` | Active |
| 28 | Neymar Junior | `neymar2207123` | Active |
| 29 | Cristiano Ronaldo | `cristiano2207124` | Active |
| 30 | Adib Raian | `adib2207020` | Active |
| 31 | Sazzad Ahmed | `sazzad2207026` | Active |
| 32 | Utsa Roy | `utsa2207027` | Active |
| 33 | Manjar Hossain | `manjar2207029` | Active |
| 34 | Ahmed Kaif | `ahmed2207025` | Active |

Users below are **pending** (need admin approval to activate):

| ID | Name | Password | Role |
|----|------|----------|------|
| 12 | Korey Donnelly | `password` | Pending |
| 13 | Dr. Rachel Harvey | `password` | Pending |
| 15 | Abdul Ahad | `password` | Pending |
| 35 | Tanvir Ahmed | `tanvir2207030` | Pending |
| 36 | Nusrat Jahan | `nusrat2207031` | Pending |
| 37 | Sadia Islam | `sadia2207032` | Pending |
| 38 | Rakib Hasan | `rakib2207033` | Pending |
| 39 | Sharmin Akter | `sharmin2207035` | Pending |
| 40 | Mahfuzur Rahman | `mahfuzur2207036` | Pending |
| 41 | Jannatul Ferdous | `jannatul2207037` | Pending |
| 42 | Arif Hossain | `arif2207038` | Pending |

---

## Project Structure

```
Blog/
├── blog-backend/          # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # API controllers
│   │   │   └── Middleware/          # admin middleware
│   │   ├── Models/                  # Eloquent models
│   │   └── Services/                # QuoteService
│   ├── database/
│   │   ├── factories/               # Model factories
│   │   ├── migrations/              # DB schema (23 migrations)
│   │   └── seeders/                 # Demo data seeders
│   └── routes/api.php               # All API routes
│
├── blog-frontend/         # Next.js app
│   ├── app/
│   │   ├── (user)/         # Public & user pages
│   │   └── (admin)/        # Admin panel pages
│   ├── components/         # Shared components
│   ├── hooks/              # Custom hooks (useAuth)
│   ├── api/                # API client functions
│   └── utilities/          # Axios instances
```

---

## API Overview

All endpoints are under `http://localhost:8000/api/`.

**Public:** `auth/login`, `auth/register`, `blogs`, `categories`, `site-settings`, `contact`, `newsletter`, `quote`

**Authenticated (Sanctum):** `auth/logout`, `auth/me`, `users/me`, `blogs/*` (comments, likes, favorites), `friend-requests/*`, `messages/*`, `notifications/*`, `comment-reports`

**Admin (auth + admin middleware):** `admin/blogs`, `admin/users`, `admin/blog-requests`, `admin/categories`, `admin/contact`, `admin/comment-reports`, `admin/newsletter`, `admin/site-settings`

---

## Seeded Data

Run `php artisan migrate:fresh --seed` to get:

- 41 users (1 admin + 14 active students + 7 factory users + 19 pending)
- 30 factory blogs + 28 student blogs
- 150+ comments, 200+ likes, favorites
- 8 blog requests (mix of pending/approved/rejected)
- 6 comment reports
- 10 contact messages
- 6 newsletter subscribers
- 8 friend conversation threads (with replies)
- 26 accepted + 4 pending friend requests
- 10 categories

---

## Notes

- No email verification or password reset (by design)
- New users register as "pending" — an admin must approve them
- Avatar URLs use UI Avatars (initials-based, no upload needed)
- File uploads use `_method=PUT` spoofing (PHP limitation with PATCH/PUT)
- React Query cache is cleared on login/logout to prevent data leaking between sessions
