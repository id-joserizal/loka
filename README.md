# LOKA — Dunia Untuk Semua Cerita 📖

**LOKA** adalah platform menulis dan membaca artikel berbasis web yang terinspirasi oleh Medium.com. Dirancang khusus untuk penulis independen, pemikir, dan pembaca di Indonesia untuk berbagi ide, gagasan mendalam, dan wawasan teknis.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Lucide Icons
- **Database & Auth & Storage**: [Supabase](https://supabase.com/)
  - Postgres Database dengan Row Level Security (RLS)
  - Supabase Auth (Email/Password + Google OAuth)
  - Supabase Storage (`article-covers` & `avatars`)
- **Editor**: [Tiptap](https://tiptap.dev/) (Rich-text block editor dengan H1-H3, quote, code block, image, link embed)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📁 Struktur Folder Proyek

```
loka/
├── src/
│   ├── app/                    # App Router Routes
│   │   ├── (auth)/             # Login & Register routes
│   │   ├── article/[slug]/     # Halaman baca artikel
│   │   ├── bookmarks/          # Artikel tersimpan user
│   │   ├── dashboard/          # Dashboard manajemen artikel & statistik
│   │   ├── edit/[id]/          # Editor edit artikel
│   │   ├── profile/[username]/ # Halaman profil publik
│   │   ├── search/             # Halaman pencarian
│   │   ├── settings/           # Pengaturan profil & avatar
│   │   ├── tag/[slug]/         # Listing artikel per topik/tag
│   │   ├── write/              # Editor artikel baru
│   │   ├── layout.tsx          # Root Layout & Metadata SEO
│   │   ├── not-found.tsx       # Custom 404
│   │   ├── error.tsx           # Error Boundary
│   │   ├── sitemap.ts          # Dynamic Sitemap
│   │   └── robots.ts           # SEO Robots.txt
│   ├── components/             # Reusable UI & Feature components
│   │   ├── article/            # Article Card, Progress Bar, Tiptap Renderer
│   │   ├── editor/             # Tiptap Editor & Publish Modal
│   │   ├── social/             # Clap, Comment, Follow, Bookmark, Share buttons
│   │   └── navbar.tsx          # Main Header Navbar
│   ├── lib/
│   │   ├── supabase/           # Client, Server, & Proxy session helpers
│   │   └── utils.ts            # Slugify, Reading time calculation, Excerpt helper
│   └── proxy.ts                # Next.js 16 Proxy Entry Point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database SQL Migration script
├── .env.local.example          # Environment Variables Template
└── README.md
```

---

## 🛠️ Panduan Setup Lokal

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/id-joserizal/loka.git
cd loka
npm install
```

### 2. Konfigurasi Environment Variables

Salin `.env.local.example` menjadi `.env.local`:

```bash
cp .env.local.example .env.local
```

Isi variabel di `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Eksekusi SQL Migration di Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) -> pilih proyek Anda.
2. Masuk ke **SQL Editor**.
3. Salin seluruh isi file [`supabase/migrations/001_initial_schema.sql`](file:///d:/Project/loka/supabase/migrations/001_initial_schema.sql) dan jalankan (**Run**).
4. Script ini otomatis membuat:
   - Tabel: `profiles`, `articles`, `tags`, `article_tags`, `comments`, `claps`, `follows`, `bookmarks`.
   - Index performa untuk `slug`, `author_id`, `tag_id`, dll.
   - Row Level Security (RLS) policies.
   - Trigger otomatis membuat `profile` saat registrasi user baru.
   - Storage Buckets: `article-covers` dan `avatars` (Public).

### 4. Setup Google OAuth (Opsional)

1. Di Supabase Dashboard -> **Authentication** -> **Providers** -> aktifkan **Google**.
2. Masukkan `Client ID` dan `Client Secret` dari Google Cloud Console.
3. Tambahkan Redirect URL: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`

### 5. Jalankan Development Server

```bash
npm run dev
```

Akses aplikasi di browser: **`http://localhost:3000`** (atau `http://localhost:3001`).

---

## 🌐 Panduan Deployment ke Vercel

### Langkah 1: Push Kode ke GitHub

```bash
git add .
git commit -m "feat: complete LOKA platform"
git push origin main
```

### Langkah 2: Import Proyek di Vercel Dashboard

1. Masuk ke [Vercel Dashboard](https://vercel.com/).
2. Klik **Add New...** -> **Project**.
3. Pilih repository GitHub `loka`.
4. Framework Preset: **Next.js**.

### Langkah 3: Konfigurasi Environment Variables di Vercel

Pada bagian **Environment Variables** di Vercel, tambahkan key berikut:

| Key | Example Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Public Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | URL domain Vercel Anda |

### Langkah 4: Update Auth Redirect URLs di Supabase

Setelah aplikasi di-deploy dan mendapatkan URL Vercel (misal `https://loka-app.vercel.app`):

1. Buka Supabase Dashboard -> **Authentication** -> **URL Configuration**.
2. Set **Site URL**: `https://loka-app.vercel.app`
3. Tambahkan ke **Redirect URLs**:
   - `https://loka-app.vercel.app/**`
   - `https://loka-app.vercel.app/auth/callback`

---

## 📝 Lisensi

Dipublikasikan di bawah lisensi MIT. Silakan gunakan dan kembangkan sesuai kebutuhan.
