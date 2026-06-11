# Study Hub — Exam Preparation App

An online exam preparation platform with question banks, mock tests, and an admin panel. Built with vanilla JavaScript and Firebase Realtime Database.

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
| `firebase-config.js` | Firebase configuration — project keys, initializes Realtime Database and Storage |
| `vercel.json` | Vercel deployment config (clean URLs) |

### Other

| File | What it does |
|------|-------------|
| `.gitignore` | Tells Git to ignore `.vercel` folder (local cache) |
| `README.md` | This file |

### Removed (no longer needed)

| File | Reason removed |
|------|---------------|
| `server.js` | Replaced by Firebase Realtime Database |
| `start.bat` | Was for starting the old Node server |
| `data/data.json` | Data now stored in Firebase |
| `uploads/` | Images now stored as data URLs in the database |
| `package.json` / `node_modules` | No server = no Node dependencies |
| `server.log` / `server_err.txt` | Old server logs |

---

## How It Works

### Data Flow

```
User action → script.js modifies in-memory data → saveData() writes to Firebase Realtime Database
Page load → loadData() reads from Firebase → renders UI
```

### Images

Images are stored as **data URLs** (base64 encoded) directly inside question data in the database. No external storage service needed.

### Admin Access (Secret)

The Admin panel is **hidden** from regular users. To access:
1. **Click the "ExamPro" logo 5 times quickly** → a password prompt appears
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

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable **Realtime Database** (start in test mode)
3. Copy the Firebase config from Project Settings → Web App
4. Paste into `firebase-config.js` (replace the existing values)
5. Push to a new GitHub repo → Deploy on Vercel

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 + CSS3 | UI structure and styling |
| Vanilla JS | All logic — no frameworks |
| Firebase Realtime Database | Data storage (questions, mock tests) |
| Vercel | Hosting (static site) |
