# Blog Platform — Backend (Laravel 11)

Full-stack blog platform backend built with Laravel 11, MySQL 8, and Sanctum API tokens. Serves a JSON API for the Next.js frontend and includes a Blade-based admin dashboard.

---

## Local Setup

Requires PHP 8.2+, Composer 2, MySQL 8, Node 20+.

```bash
cd blog-backend

# 1. Install PHP dependencies
composer install

# 2. Copy env and generate the app key
cp .env.example .env
php artisan key:generate

# 3. Create the database
mysql -u root -e "CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Edit .env — set DB_DATABASE=blog and your DB_USERNAME / DB_PASSWORD
#    Example:
#      DB_CONNECTION=mysql
#      DB_HOST=127.0.0.1
#      DB_PORT=3306
#      DB_DATABASE=blog
#      DB_USERNAME=root
#      DB_PASSWORD=

# 5. Migrations + dummy data (one command)
php artisan migrate:fresh --seed

# 6. Publicly serve uploaded images
php artisan storage:link

# 7. Build Breeze's Blade CSS (only for the Blade admin dashboard)
npm install && npm run build

# 8. Serve
php artisan serve
# → http://localhost:8000
```

**Seeded admin credentials:** `admin@blog.local` / `Admin@123`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register (status → pending) |
| POST | `/api/auth/login` | Public | Login (rejects pending/banned) |
| POST | `/api/auth/logout` | Sanctum | Logout |
| GET | `/api/auth/me` | Sanctum | Current user |
| PATCH | `/api/users/me` | Sanctum | Update profile |
| GET | `/api/blogs` | Public | Blog list (search, filter, sort, paginate) |
| GET | `/api/blogs/featured` | Public | Featured blogs |
| GET | `/api/blogs/popular` | Public | Popular blogs |
| GET | `/api/blogs/{id}` | Public | Blog detail |
| GET | `/api/blogs/mine` | Sanctum | Current user's blogs |
| GET | `/api/categories` | Public | All categories |
| POST | `/api/contact` | Public | Contact form |
| POST | `/api/newsletter` | Public | Newsletter subscribe |
| GET | `/api/site-settings` | Public | Site settings |

All admin endpoints are under `/api/admin/*` and require Sanctum + admin privileges.

---

## Database

- `php artisan migrate:fresh --seed` populates all tables with sample data
- Users: 1 admin + 10 active + 2 pending
- Categories: 10
- Blogs: 30 (5 featured, 5 popular)
- Comments, notifications, site settings

## Blade Dashboard

The Blade dashboard at `/dashboard/{section}` demonstrates Laravel framework concepts: routes with parameters, Blade layouts/conditionals/loops, custom middleware with parameters, Guzzle API integration, AJAX widgets, CSRF protection, and resource controllers.

## License

MIT
