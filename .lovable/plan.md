
# Migrasi ke React + Tailwind (Vercel-ready)

Saat ini project menggunakan **TanStack Start** (full-stack, target Cloudflare Workers) dengan file-based routing di `src/routes/` dan server functions. Untuk deploy mulus di **Vercel** sebagai SPA, kita ubah jadi **Vite + React + React Router + Tailwind**, dengan backend tetap menggunakan Lovable Cloud (Supabase) langsung dari client.

## Yang akan diubah

### 1. Setup build & routing
- Ganti `vite.config.ts` ke konfigurasi Vite + React standar (hapus `@lovable.dev/vite-tanstack-config`, plugin Cloudflare, dan TanStack Start).
- Hapus `src/server.ts`, `src/start.ts`, `src/router.tsx`, `src/routeTree.gen.ts`, `wrangler.jsonc`.
- Tambah `react-router-dom` untuk routing SPA.
- Buat `index.html` + `src/main.tsx` + `src/App.tsx` sebagai entry point standar Vite.
- Tambah file `vercel.json` dengan SPA rewrite (`/* → /index.html`) agar route langsung (mis. `/dashboard/hasil`) tidak 404.

### 2. Konversi semua route
Pindahkan konten dari `src/routes/*.tsx` ke `src/pages/*.tsx`:
- `routes/index.tsx` → `pages/Landing.tsx` (`/`)
- `routes/dashboard.tsx` → `pages/DashboardLayout.tsx` (parent, `<Outlet/>`)
- `routes/dashboard.index.tsx` → `pages/dashboard/Home.tsx`
- `routes/dashboard.dataset.tsx` → `pages/dashboard/Dataset.tsx`
- `routes/dashboard.analisis.tsx` → `pages/dashboard/Analisis.tsx`
- `routes/dashboard.hasil.tsx` → `pages/dashboard/Hasil.tsx`
- `routes/dashboard.tentang.tsx` → `pages/dashboard/Tentang.tsx`

Ganti import:
- `@tanstack/react-router` → `react-router-dom` (`Link`, `useNavigate`, `Outlet`, `useLocation`).
- Hapus semua `createFileRoute` / `Route.useParams()` dll.
- Definisikan routing di `App.tsx` dengan `<BrowserRouter>` + `<Routes>`.

### 3. Backend / data
- Logika Naive Bayes (`src/lib/naive-bayes.ts`) sudah jalan di client — tetap dipakai.
- Akses Supabase tetap via `src/integrations/supabase/client.ts` (client publishable key).
- Hapus file server-only: `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts` (tidak relevan di Vercel SPA tanpa server functions).
- Upload XLSX, training, evaluasi, simpan dataset/tweet semuanya jalan di browser → Supabase langsung. Tidak butuh Node/Express terpisah.

### 4. Styling & SEO
- Tailwind config tetap (sudah lewat `src/styles.css`).
- Tambah `react-helmet-async` (atau manual `document.title` per page) untuk title/meta yang sebelumnya ada di `head()` TanStack.

### 5. Variabel environment di Vercel
Setelah deploy, user perlu set di Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

(Nilainya sama dengan `.env` saat ini.)

## File yang dibuat/diubah

**Baru:** `index.html`, `src/main.tsx`, `src/App.tsx`, `src/pages/*`, `vercel.json`
**Dimodifikasi:** `vite.config.ts`, `package.json` (dependencies)
**Dihapus:** `src/routes/`, `src/router.tsx`, `src/routeTree.gen.ts`, `src/server.ts`, `src/start.ts`, `wrangler.jsonc`, `src/integrations/supabase/client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`

## Catatan penting
- Fungsionalitas tetap 100% sama — hanya kerangka framework yang berubah.
- Setelah ini, deploy ke Vercel cukup: push ke GitHub → Import project di Vercel → set 2 env var → Deploy.
- Backend Express terpisah **tidak diperlukan** karena semua logika (XLSX parsing, training Naive Bayes, evaluasi) sudah jalan di browser dan Supabase menangani penyimpanan.

Approve plan ini untuk saya mulai konversi.
