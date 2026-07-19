-- ============================================================================
-- DATABASE SCHEMA FOR CLASSROOM WRITES
-- ============================================================================
-- This file contains the complete database schema for the blog platform.
-- It includes all 14 application tables plus Laravel internal tables.
-- Each table has comments explaining its purpose and how it's used.
--
-- Engine: InnoDB
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- ============================================================================


-- ============================================================================
-- TABLE: users
-- ============================================================================
-- Stores all registered users. Each user has a status lifecycle:
-- pending (default after registration) -> active (after admin approval)
-- or banned (if admin bans them).
-- is_super_user flag identifies admin accounts.
-- avatar can be a relative storage path or an absolute URL (UI Avatars).
-- ============================================================================
CREATE TABLE `users` (
  `id`               int NOT NULL AUTO_INCREMENT,
  `name`             varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email`            varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status`           enum('pending','active','banned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `is_super_user`    tinyint(1) NOT NULL DEFAULT '0',
  `avatar`           varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_details`   varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age`              int DEFAULT NULL,
  `gmail`            varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password`         varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token`   varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at`       timestamp NULL DEFAULT NULL,
  `updated_at`       timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: personal_access_tokens
-- ============================================================================
-- Laravel Sanctum's token storage. Every API login creates a token here.
-- The actual token is stored as a SHA-256 hash. tokenable_id links to users.id.
-- Used by auth:sanctum middleware to authenticate API requests.
-- ============================================================================
CREATE TABLE `personal_access_tokens` (
  `id`                 int NOT NULL AUTO_INCREMENT,
  `tokenable_type`     varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id`       int NOT NULL,
  `name`               text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token`              varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities`          text COLLATE utf8mb4_unicode_ci,
  `last_used_at`       timestamp NULL DEFAULT NULL,
  `expires_at`         timestamp NULL DEFAULT NULL,
  `created_at`         timestamp NULL DEFAULT NULL,
  `updated_at`         timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: categories
-- ============================================================================
-- Blog categories. Each has a unique slug used in URL routes
-- (e.g., "education", "technology"). The image field stores category
-- cover images. Linked from blogs via category_id.
-- ============================================================================
CREATE TABLE `categories` (
  `id`         int NOT NULL AUTO_INCREMENT,
  `name`       varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug`       varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image`      varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_unique` (`name`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: blogs
-- ============================================================================
-- Core content table. Stores all published blog posts.
-- content is stored as HTML from the TipTap rich text editor.
-- submitted_by links to the author (users.id). category_id links to categories.
-- is_featured and is_popular control homepage display.
-- likes_count is a denormalized counter updated on every like/unlike.
-- ============================================================================
CREATE TABLE `blogs` (
  `id`             int NOT NULL AUTO_INCREMENT,
  `title`          varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content`        longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id`    int DEFAULT NULL,
  `submitted_by`   int DEFAULT NULL,
  `author_name`    varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_avatar`  varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blog_pic_url`   varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time_read`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '3 mins read',
  `is_featured`    tinyint(1) NOT NULL DEFAULT '0',
  `is_popular`     tinyint(1) NOT NULL DEFAULT '0',
  `likes_count`    int unsigned NOT NULL DEFAULT '0',
  `publish_date`   date DEFAULT NULL,
  `created_at`     timestamp NULL DEFAULT NULL,
  `updated_at`     timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `blogs_category_id_foreign` (`category_id`),
  KEY `blogs_submitted_by_foreign` (`submitted_by`),
  CONSTRAINT `blogs_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `blogs_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: comments
-- ============================================================================
-- Comments on blogs. Each comment belongs to a blog and a user.
-- is_anonymous allows users to comment without revealing their name.
-- parent_id enables threaded/nested replies (self-referencing FK).
-- Deletes cascade: if a blog is deleted, its comments are too.
-- ============================================================================
CREATE TABLE `comments` (
  `id`          int NOT NULL AUTO_INCREMENT,
  `text`        text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT '0',
  `user_id`     int NOT NULL,
  `blog_id`     int NOT NULL,
  `parent_id`   int DEFAULT NULL,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_user_id_foreign` (`user_id`),
  KEY `comments_blog_id_foreign` (`blog_id`),
  KEY `comments_parent_id_foreign` (`parent_id`),
  CONSTRAINT `comments_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: likes
-- ============================================================================
-- Tracks which users liked which blogs.
-- The UNIQUE(user_id, blog_id) constraint ensures one like per user per blog.
-- When a like is created/deleted, blogs.likes_count is updated accordingly.
-- ============================================================================
CREATE TABLE `likes` (
  `id`         int NOT NULL AUTO_INCREMENT,
  `user_id`    int NOT NULL,
  `blog_id`    int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `likes_user_id_blog_id_unique` (`user_id`,`blog_id`),
  KEY `likes_blog_id_foreign` (`blog_id`),
  CONSTRAINT `likes_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: favorites
-- ============================================================================
-- Bookmarking system. Same structure as likes — users can bookmark blogs
-- to read later. The unique constraint prevents duplicates.
-- The frontend shows bookmarked blogs on the /favourites page.
-- ============================================================================
CREATE TABLE `favorites` (
  `id`         int NOT NULL AUTO_INCREMENT,
  `user_id`    int NOT NULL,
  `blog_id`    int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_user_id_blog_id_unique` (`user_id`,`blog_id`),
  KEY `favorites_blog_id_foreign` (`blog_id`),
  CONSTRAINT `favorites_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: blog_requests
-- ============================================================================
-- Students submit blog ideas here before they become published blogs.
-- An admin reviews each request and can approve (auto-creates blog),
-- reject (with optional note), or leave it pending.
-- When approved, the BlogRequestController creates a corresponding blog
-- entry in the blogs table and sends a notification to the submitter.
-- ============================================================================
CREATE TABLE `blog_requests` (
  `id`             int NOT NULL AUTO_INCREMENT,
  `title`          varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content`        longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id`    int DEFAULT NULL,
  `blog_image`     varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_name`    varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_avatar`  varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time_read`      varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_by`   int NOT NULL,
  `status`         enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `admin_note`     text COLLATE utf8mb4_unicode_ci,
  `created_at`     timestamp NULL DEFAULT NULL,
  `updated_at`     timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `blog_requests_category_id_foreign` (`category_id`),
  KEY `blog_requests_submitted_by_foreign` (`submitted_by`),
  CONSTRAINT `blog_requests_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `blog_requests_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: comment_reports
-- ============================================================================
-- Users can report inappropriate comments. Each report has a reason
-- (spam, harassment, inappropriate, misinformation, other).
-- Admins review reports and can dismiss them or delete the comment.
-- The UNIQUE(comment_id, reported_by) constraint prevents duplicate reports.
-- ============================================================================
CREATE TABLE `comment_reports` (
  `id`          int NOT NULL AUTO_INCREMENT,
  `comment_id`  int NOT NULL,
  `reported_by` int NOT NULL,
  `reason`      enum('spam','harassment','inappropriate','misinformation','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status`      enum('pending','reviewed','dismissed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `comment_reports_comment_id_reported_by_unique` (`comment_id`,`reported_by`),
  KEY `comment_reports_reported_by_foreign` (`reported_by`),
  CONSTRAINT `comment_reports_comment_id_foreign` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_reports_reported_by_foreign` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: friend_requests
-- ============================================================================
-- Manages friend connections between users. Status determines the state:
-- pending (sent, awaiting response), accepted (friends), rejected.
-- The UNIQUE(sender_id, receiver_id) constraint ensures one request per pair.
-- Friend connections are bidirectional — when status = accepted, both users
-- see each other in their friends list.
-- ============================================================================
CREATE TABLE `friend_requests` (
  `id`          int NOT NULL AUTO_INCREMENT,
  `sender_id`   int NOT NULL,
  `receiver_id` int NOT NULL,
  `status`      enum('pending','accepted','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `friend_requests_sender_id_receiver_id_unique` (`sender_id`,`receiver_id`),
  KEY `friend_requests_receiver_id_foreign` (`receiver_id`),
  CONSTRAINT `friend_requests_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friend_requests_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: messages
-- ============================================================================
-- Direct messaging system. Messages can be top-level (parent_id IS NULL)
-- or replies within a thread (parent_id references another message).
-- sender_id/receiver_id link to users. The read flag tracks if the
-- receiver has seen the message. Only participants can view conversations
-- (enforced by controller logic with 403 checks).
-- ============================================================================
CREATE TABLE `messages` (
  `id`          int NOT NULL AUTO_INCREMENT,
  `sender_id`   int NOT NULL,
  `receiver_id` int NOT NULL,
  `subject`     varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body`        text COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id`   int DEFAULT NULL,
  `read`        tinyint(1) NOT NULL DEFAULT '0',
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  KEY `messages_receiver_id_foreign` (`receiver_id`),
  KEY `messages_parent_id_foreign` (`parent_id`),
  CONSTRAINT `messages_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: app_notifications
-- ============================================================================
-- Notification system. Stores all notifications for users.
-- Type determines the notification category and the message template:
-- welcome, blog_posted, friend_request, friend_accepted, comment, like,
-- request_approved. blog_id and friend_request_id are optional FKs that
-- link to the related entity for navigation (clicking the notification
-- goes to the related blog or friend request page).
-- ============================================================================
CREATE TABLE `app_notifications` (
  `id`               int NOT NULL AUTO_INCREMENT,
  `recipient_id`     int NOT NULL,
  `action_by_id`     int NOT NULL,
  `blog_id`          int DEFAULT NULL,
  `comment_id`       int DEFAULT NULL,
  `friend_request_id` int DEFAULT NULL,
  `type`             enum('like','comment','favorite','request_approved','welcome','blog_posted','friend_request','friend_accepted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'like',
  `read`             tinyint(1) NOT NULL DEFAULT '0',
  `created_at`       timestamp NULL DEFAULT NULL,
  `updated_at`       timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_notifications_recipient_id_foreign` (`recipient_id`),
  KEY `app_notifications_action_by_id_foreign` (`action_by_id`),
  KEY `app_notifications_blog_id_foreign` (`blog_id`),
  KEY `app_notifications_comment_id_foreign` (`comment_id`),
  KEY `app_notifications_friend_request_id_foreign` (`friend_request_id`),
  CONSTRAINT `app_notifications_action_by_id_foreign` FOREIGN KEY (`action_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `app_notifications_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `app_notifications_comment_id_foreign` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `app_notifications_friend_request_id_foreign` FOREIGN KEY (`friend_request_id`) REFERENCES `friend_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `app_notifications_recipient_id_foreign` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: contacts
-- ============================================================================
-- Contact form submissions from the /contact page.
-- user_id is set if the submitter is logged in (nullable for guests).
-- replied flag tracks whether an admin has sent a reply.
-- Admin replies create an entry in the messages table to the user's user_id.
-- ============================================================================
CREATE TABLE `contacts` (
  `id`         int NOT NULL AUTO_INCREMENT,
  `user_id`    int DEFAULT NULL,
  `name`       varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone`      varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject`    varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message`    text COLLATE utf8mb4_unicode_ci NOT NULL,
  `replied`    tinyint(1) NOT NULL DEFAULT '0',
  `is_read`    tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contacts_user_id_foreign` (`user_id`),
  CONSTRAINT `contacts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: newsletter_subscribers
-- ============================================================================
-- Stores newsletter subscription emails. Each subscriber has a unique email.
-- Admins can view and remove subscribers from the admin panel.
-- ============================================================================
CREATE TABLE `newsletter_subscribers` (
  `id`         int NOT NULL AUTO_INCREMENT,
  `name`       varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- TABLE: site_settings
-- ============================================================================
-- Single-row configuration table for the entire site.
-- Stores hero section content, about page data, contact page info,
-- social media links, and footer text. JSON columns hold complex nested
-- data for about_page (name, bio, roles, social links) and contact_page
-- (heading, description, phones, emails, addresses, form fields).
-- ============================================================================
CREATE TABLE `site_settings` (
  `id`            int NOT NULL AUTO_INCREMENT,
  `site_title`    varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_logo`     varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_title`    varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `footer_text`   text COLLATE utf8mb4_unicode_ci,
  `social_links`  json DEFAULT NULL,
  `about_page`    json DEFAULT NULL,
  `contact_page`  json DEFAULT NULL,
  `created_at`    timestamp NULL DEFAULT NULL,
  `updated_at`    timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- LARAVEL INTERNAL TABLES (not application-specific)
-- ============================================================================


-- Cache & cache locks — Laravel's file/database cache driver storage.
-- Used by QuoteService to cache the quote of the day for 1 hour.
CREATE TABLE `cache` (
  `key`        varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value`      mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache_locks` (
  `key`        varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Sessions — stores session data for the Blade/SSR side of the app
-- (the API side is stateless and doesn't use sessions).
CREATE TABLE `sessions` (
  `id`            varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id`       int DEFAULT NULL,
  `ip_address`    varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent`    text COLLATE utf8mb4_unicode_ci,
  `payload`       longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Jobs, job_batches, failed_jobs — Laravel queue tables.
-- Not actively used in this project (no async jobs configured).
CREATE TABLE `jobs` (
  `id`           int NOT NULL AUTO_INCREMENT,
  `queue`        varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload`      longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts`     smallint unsigned NOT NULL,
  `reserved_at`  int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at`   int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_batches` (
  `id`             varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name`           varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs`     int NOT NULL,
  `pending_jobs`   int NOT NULL,
  `failed_jobs`    int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options`        mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at`   int DEFAULT NULL,
  `created_at`     int NOT NULL,
  `finished_at`    int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id`         int NOT NULL AUTO_INCREMENT,
  `uuid`       varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload`    longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception`  longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Password reset tokens — Laravel default table for password resets.
-- Not actively used (password reset is disabled in this project).
CREATE TABLE `password_reset_tokens` (
  `email`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Migrations — Laravel's record of which migrations have been run.
CREATE TABLE `migrations` (
  `id`        int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch`     int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
