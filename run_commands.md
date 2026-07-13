# Run Commands — Blog Platform

## Prerequisites

- PHP 8.3+
- Composer
- Node.js 20+
- MySQL
- A database named `blog` (or update `DB_DATABASE` in backend `.env`)

---

## Backend (Laravel 11)

```bash
cd blog-backend

# Install PHP dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database in .env then run:
php artisan migrate --seed

# Create storage symlink (for file uploads)
php artisan storage:link

# Start the backend server
php artisan serve
```

The API runs at **http://localhost:8000**.

---

## Frontend (Next.js 16)

```bash
cd blog-frontend

# Install npm dependencies
npm install

# Setup environment (if .env.local doesn't exist)
cp .env.example .env.local

# Start the dev server
npm run dev
```

The app runs at **http://localhost:3000**.

---

## Default Admin Credentials

| Email              | Password    |
| ------------------ | ----------- |
| admin@blog.local   | Admin@123   |

---

## Notes

- New users are created in `pending` status — an admin must activate them via **Admin → Pending Users**.
- No email sending is configured; password reset and email verification are not supported.
- The frontend `NEXT_PUBLIC_API_URL` in `.env.local` must point to the backend API base URL.
