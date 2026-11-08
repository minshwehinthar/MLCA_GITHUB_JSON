# MLCA Website

Full-stack website for the **Mon Literature and Culture Association (MLCA), University of Computer Studies – Hpa-An**.

It includes a public, multilingual website (English, Myanmar, Mon) and a multi-user admin dashboard with role-based access control and API-driven CRUD for all content.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI, sonner |
| Backend | Laravel 13, Sanctum, SQLite local cache |
| Data storage | JSON vault committed to GitHub |
| Auth | Bearer tokens (localStorage) with role/permission middleware |

## Requirements

- Node.js 20+ and npm
- PHP 8.3+, Composer
- SQLite (bundled with PHP)

## Quick start

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Create the local SQLite cache and import the JSON vault:

```bash
touch database/database.sqlite
php artisan migrate
php artisan vault:import --force
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

The JSON vault is the durable source of truth. SQLite is only a local cache so the existing admin authentication, permissions and query code keep working without MySQL.

#### JSON vault

Clone the vault into `backend/storage/app/vault`:

```bash
cd backend
git clone https://github.com/minshwehinthar/JetanaMemoryVault.git storage/app/vault
```

MLCA data lives under `mlca/`:

- `mlca/data/mlca.json` — public content, settings, members, roles and permissions
- `mlca/media/` — uploaded images, videos and documents

Every admin create/update/delete and upload triggers an automatic JSON export, media sync,
git commit and push. Users, password hashes, tokens, contact messages and activity logs stay
in the local private vault file and are not committed to the public repository.

Useful commands:

```bash
php artisan vault:status
php artisan vault:export
php artisan vault:export --push
php artisan vault:import --force
```

Set `VAULT_INCLUDE_PRIVATE=true` only if the vault repository is private.

The API is served at `http://127.0.0.1:8000/api`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The public site is at `/`, the dashboard at `/admin`.

### Environment variables

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Super Administrator | `superadmin@mlca.edu` | `Admin@12345` |
| Administrator | `admin@mlca.edu` | `Admin@12345` |
| Editor | `editor@mlca.edu` | `Editor@12345` |
| Content Writer | `content@mlca.edu` | `Content@12345` |

## Features

### Public website
- Home page with hero, statistics, featured posts, activities, events and announcements
- News, activities and events list/detail pages
- Gallery albums with lightbox, videos (YouTube/Vimeo or uploaded), downloadable documents
- Members directory with executive committee view and search
- About page content (history, vision, mission, objectives), contact form and social links
- Language switcher for English, Myanmar and Mon

### Admin dashboard
- Permission-filtered sidebar and multi-role accounts
- Dashboard with counters, recent content, activity log and monthly post chart
- Full CRUD: posts, activities, events, gallery albums (with image manager), videos, documents, members
- Reference data: categories, static pages, achievements, navigation menus, website settings
- Contact messages inbox with read/unread state
- Administrator accounts plus role permission editor
- Activity log audit trail and personal profile/password management
- Image/file uploads decoupled from content payloads

## Project structure

```
mon-association/
├── backend/                 Laravel API
│   ├── app/Http/Controllers/Api/         Public + Admin controllers
│   ├── app/Http/Middleware/              Locale, active user, permission checks
│   ├── app/Http/Resources/               JSON response shapes
│   ├── database/seeders/                 Roles, users, sample content and media
│   └── routes/api.php
└── frontend/                Next.js app
    ├── src/app/(public)/                 Public pages
    ├── src/app/admin/                    Dashboard pages
    ├── src/components/{ui,site,admin}/   UI kit, site sections, admin building blocks
    ├── src/providers/                    Locale, auth and site contexts
    └── src/lib/                          API client, types, i18n, helpers
```

## API overview

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Public: `/api/site`, `/api/home`, `/api/posts`, `/api/activities`, `/api/events`, `/api/gallery/albums`, `/api/videos`, `/api/documents`, `/api/members`, `/api/pages/{slug}`, `/api/achievements`, `POST /api/contact`
- Admin: `/api/admin/dashboard`, content CRUD under `/api/admin/*`, `/api/admin/uploads`, `/api/admin/settings`, `/api/admin/messages`, `/api/admin/administrators`, `/api/admin/roles`, `/api/admin/activity-logs`

All responses use the envelope:

```json
{ "success": true, "message": "...", "data": {}, "meta": {}, "errors": {} }
```

Localization is selected with `?locale=en|my|mnw` or the `X-Locale` header (default `en`).

## Build

```bash
cd frontend
npm run lint
npm run build
```
