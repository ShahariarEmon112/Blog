# Blog Platform — Frontend (Next.js 16)

Full-stack blog platform frontend built with Next.js 16 (App Router), Mantine 9, Tailwind CSS, TanStack React Query, and TipTap.

---

## Local Setup

Requires Node 20+ and the Laravel backend running on `http://localhost:8000`.

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

Sign in on `http://localhost:3000/login` with the seeded admin credentials (`admin@blog.local` / `Admin@123`) to reach the admin panel.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (hero, categories, featured & recent blogs) |
| `/blogs` | Blog listing (search, filter, sort, pagination) |
| `/blogs/{id}` | Blog detail (comments, likes, favorites, reports) |
| `/login` | Login |
| `/register` | Register |
| `/profile` | Edit profile |
| `/favourites` | My favorites |
| `/my-blogs` | My approved blogs |
| `/my-requests` | My blog requests |
| `/request-blog` | Submit a blog request |
| `/admin/*` | Admin panel (blog CRUD, users, categories, settings) |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** Mantine 9 + Tailwind CSS
- **Data:** TanStack React Query v5
- **HTTP:** axios (public + private interceptors)
- **Auth:** Sanctum personal access tokens (localStorage)
- **Editor:** TipTap with StarterKit, Image, Link, Underline, Placeholder
- **Notifications:** sonner toasts

## License

MIT
