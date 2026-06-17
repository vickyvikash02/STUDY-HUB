# Study Hub — Exam Preparation App

An online exam preparation platform with question banks, mock tests, and an admin panel. Built with vanilla JavaScript and Supabase.

## Live Demo

https://study-hub-six-lake.vercel.app

---

## Files & Folders

### Core Files

| File | What it does |
|------|-------------|
| `index.html` | Main HTML page — contains all UI: dashboard, admin panel, question bank, mock test player, settings |
| `script.js` | All JavaScript logic — data management, rendering, navigation, admin CRUD, mock test engine |
| `style.css` | Complete styling — responsive layout, dark/light theme, admin UI, mock test player, question cards |
| `supabase-config.js` | Supabase client initialization — URL and anon key |
| `setup.sql` | SQL to create `app_data` table and RLS policies |
| `vercel.json` | Vercel deployment config (clean URLs) |

### Other

| File | What it does |
|------|-------------|
| `.gitignore` | Tells Git to ignore `.vercel` folder (local cache) |
| `README.md` | This file |

### Removed (no longer needed)

| File | Reason removed |
|------|---------------|
| `server.js` | Replaced by Supabase |
| `start.bat` | Was for starting the old Node server |
| `data/data.json` | Data now stored in Supabase |
| `uploads/` | Images now stored as data URLs in the database |
| `package.json` / `node_modules` | No server = no Node dependencies |
| `server.log` / `server_err.txt` | Old server logs |
| `firebase-config.js` | Replaced by Supabase |

---

## How It Works

### Data Flow

```
User action → script.js modifies in-memory data → saveData() upserts to Supabase (`app_data` table)
Page load → loadData() reads from Supabase → renders UI
```

### Images & Files

Images are stored as **data URLs** (base64 encoded) inside question data. E-Book PDFs are uploaded to **Supabase Storage** (public bucket `studyhub`).

### Admin Access (Secret)

The Admin panel is **hidden** from regular users. To access:
1. **Click the "Study Hub" logo 5 times quickly** → a password prompt appears
2. Enter the admin password (default: `1234` — change in `script.js` line `const ADMIN_PASS = '1234'`)
3. Admin nav item appears after login
4. Click **Logout** in sidebar to lock admin again

---

## How to Deploy

1. Push code to GitHub
2. Go to https://vercel.com → Import GitHub repo
3. Vercel auto-detects it as static — click Deploy

---

## How to Customize for a Customer

1. Create a Supabase project at https://supabase.com
2. Run `setup.sql` in Supabase Dashboard → SQL Editor (creates `app_data` table + RLS)
3. Create a public storage bucket named `studyhub` in Supabase Dashboard → Storage
4. Copy your Supabase URL and anon key from Project Settings → API
5. Paste into `supabase-config.js` (replace the existing values)
6. Push to a new GitHub repo → Deploy on Vercel

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 + CSS3 | UI structure and styling |
| Vanilla JS | All logic — no frameworks |
| Supabase | Database (`app_data` table) + Storage (PDFs) |
| Vercel | Hosting (static site) |
