# LOKA — Dunia Untuk Semua Cerita

Platform menulis dan membaca artikel, mirip Medium.com, di mana pengguna bisa menulis, mempublikasikan, membaca, dan berinteraksi dengan artikel dari penulis lain.

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth & Storage**: Supabase
- **Editor**: Tiptap (rich-text editor berbasis blok)
- **Deployment**: Vercel

## Setup Development

### 1. Clone repository

```bash
git clone https://github.com/id-joserizal/loka.git
cd loka
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Salin file contoh dan isi dengan kredensial Supabase kamu:

```bash
cp .env.local.example .env.local
```

Buka `.env.local` dan isi variabel berikut:

| Variabel | Keterangan | Cara mendapatkan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public/Anon key | Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role key (rahasia!) | Dashboard → Project Settings → API |

> ⚠️ **Jangan pernah commit `.env.local` ke GitHub!**

### 4. Setup Database Supabase

Jalankan SQL migration di **Supabase SQL Editor**:

```
supabase/migrations/001_initial_schema.sql
```

### 5. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Struktur Folder

```
src/
├── app/                    # Next.js App Router (halaman & layout)
│   ├── (auth)/             # Grup route autentikasi (login, register)
│   ├── (main)/             # Grup route utama (home, artikel, profil)
│   └── layout.tsx          # Root layout
├── components/             # Komponen React yang dapat digunakan ulang
│   ├── ui/                 # Komponen UI dasar (button, input, dll)
│   └── ...
├── lib/
│   └── supabase/           # Supabase clients (browser, server, middleware)
├── middleware.ts            # Next.js middleware (proteksi route & session)
└── types/                  # TypeScript type definitions
```

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Set environment variables di Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy otomatis setiap push ke `master`
