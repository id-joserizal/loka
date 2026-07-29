## 1. RINGKASAN PROYEK
Nama proyek: LOKA - Dunia Untuk Semua Cerita
Deskripsi: Platform menulis dan membaca artikel, mirip Medium.com, di mana pengguna bisa menulis, mempublikasikan, membaca, dan berinteraksi dengan artikel dari penulis lain.
Target pengguna: [mis. "penulis independen dan pembaca umum di Indonesia"]

## 2. TECH STACK (WAJIB DIPAKAI)
- Framework: Next.js 14+ (App Router), TypeScript
- Styling: Tailwind CSS
- Database & Auth & Storage: Supabase
  - Postgres untuk data (users, articles, comments, tags, likes, follows)
  - Supabase Auth untuk login (email/password + Google OAuth)
  - Supabase Storage untuk upload gambar cover artikel & avatar
- Editor teks: gunakan rich-text editor berbasis blok (mis. Tiptap) yang mendukung heading, bold/italic, quote, gambar, code block, dan embed link
- Deployment: Vercel (siapkan konfigurasi agar auto-deploy dari GitHub)
- Version control: struktur project harus rapi untuk di-push ke GitHub, sertakan .gitignore dan README.md yang menjelaskan cara setup environment variable Supabase

## 3. STRUKTUR DATABASE (SUPABASE / POSTGRES)
Buatkan skema tabel berikut beserta relasi dan Row Level Security (RLS) yang sesuai:
- `profiles` (id, username, full_name, bio, avatar_url, created_at)
- `articles` (id, author_id, title, slug, content (JSON dari editor), cover_image_url, excerpt, status [draft/published], reading_time, published_at, created_at, updated_at)
- `tags` (id, name, slug)
- `article_tags` (article_id, tag_id) — relasi many-to-many
- `comments` (id, article_id, user_id, parent_comment_id (untuk reply), content, created_at)
- `claps` / `likes` (id, article_id, user_id, count) — Medium punya fitur "clap" berkali-kali, boleh mulai dari like sederhana dulu
- `follows` (follower_id, following_id)
- `bookmarks` (user_id, article_id, created_at)

Tambahkan index pada slug, author_id, dan tag untuk performa query listing/search.

## 4. DAFTAR FITUR

### A. Autentikasi & Profil
- Registrasi & login (email/password, dan Google OAuth via Supabase Auth)
- Halaman profil publik: foto, nama, bio, daftar artikel yang dipublikasikan, jumlah follower/following
- Edit profil (avatar, bio, username, social links)

### B. Menulis & Editor
- Editor rich-text berbasis blok: heading (H1-H3), bold, italic, blockquote, bullet/numbered list, insert gambar, code block, embed link (YouTube/Twitter)
- Auto-save draft setiap beberapa detik
- Upload gambar cover artikel
- Estimasi waktu baca otomatis dihitung dari jumlah kata
- Preview sebelum publish
- Simpan sebagai draft atau publikasikan langsung
- Tambahkan tags/topik saat publish (maks. 5 tag)

### C. Membaca & Discovery
- Halaman utama (feed): artikel terbaru, artikel trending, artikel dari yang di-follow
- Halaman per-tag/topik
- Search artikel berdasarkan judul, tag, atau nama penulis
- Related articles di akhir tiap artikel
- Reading progress bar saat scroll membaca artikel

### D. Interaksi Sosial
- Clap/like artikel
- Komentar (dengan reply/nested comment)
- Follow/unfollow penulis
- Bookmark/save artikel untuk dibaca nanti
- Share artikel (copy link, share ke sosial media)

### E. Dashboard Penulis
- List artikel milik sendiri (draft & published)
- Statistik dasar: jumlah views, claps, komentar per artikel
- Edit/hapus artikel

### F. Non-Fungsional
- Responsive penuh (mobile-first)
- SEO: meta tag dinamis per artikel (title, description, og:image) menggunakan Next.js Metadata API
- Dark mode toggle
- Halaman 404 & error yang rapi
- Loading skeleton saat fetch data

## 5. STRUKTUR HALAMAN (ROUTES)
- `/` — Home/feed
- `/login`, `/register`
- `/write` — editor untuk menulis artikel baru
- `/edit/[id]` — edit artikel
- `/article/[slug]` — halaman baca artikel
- `/profile/[username]` — profil publik
- `/dashboard` — dashboard penulis (statistik & manajemen artikel)
- `/tag/[slug]` — listing artikel per tag
- `/search` — hasil pencarian
- `/settings` — pengaturan akun

## 6. CARA KERJA YANG DIINGINKAN
1. Mulai dengan setup project Next.js + Tailwind + koneksi Supabase (buatkan file `.env.local.example` untuk API key Supabase).
2. Buat skema database Supabase (tulis dalam bentuk SQL migration yang bisa saya jalankan di Supabase SQL Editor).
3. Bangun autentikasi terlebih dahulu (register/login/logout, proteksi halaman via middleware).
4. Bangun fitur menulis & publish artikel.
5. Bangun fitur membaca (feed, halaman artikel, tag, search).
6. Bangun fitur interaksi sosial (clap, komentar, follow, bookmark).
7. Bangun dashboard penulis.
8. Terakhir, rapikan SEO, responsive design, dan siapkan untuk deploy ke Vercel (jelaskan environment variable apa saja yang perlu di-set di Vercel dashboard).

Kerjakan bertahap sesuai urutan di atas, jangan loncat ke fitur berikutnya sebelum fitur sebelumnya selesai dan saya konfirmasi. Setiap selesai satu tahap, jelaskan secara singkat apa yang sudah dibuat dan file apa saja yang berubah.
