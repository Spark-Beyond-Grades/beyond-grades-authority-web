# Beyond Grades — Authority Portal

A **Next.js 16** web portal for authority users to manage feedback events, team structures, and participant reviews.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Auth | Firebase Auth (Microsoft OAuth) |
| Backend | REST API at configured `NEXT_PUBLIC_API_BASE_URL` |

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd beyond-grades-authority-web
npm install
```

### 2. Configure environment

Create a `.env.local` file with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── layout.js              # Root layout with AuthProvider
│   ├── page.js                # Root redirect (→ dashboard or login)
│   ├── error.js               # Global error boundary
│   ├── not-found.js           # 404 page
│   ├── login/page.js          # Microsoft OAuth login
│   ├── access-denied/page.js  # 403 page
│   ├── dashboard/
│   │   ├── page.js            # Events list + create
│   │   └── loading.js         # Skeleton loader
│   └── events/[id]/
│       ├── page.js            # Event detail + editor
│       ├── loading.js         # Skeleton loader
│       └── published/page.js  # Post-publish confirmation
├── components/
│   ├── EventForm.js           # Event name/type/description/dates
│   ├── Navbar.js              # Top nav with logout
│   ├── ParticipantUploader.js # CSV upload
│   ├── ProtectedRoute.js      # Auth guard wrapper
│   ├── PublishBar.js          # Publish/close actions
│   ├── SkillsPicker.js        # Skill selection
│   ├── StatusChip.js          # Status badge (shared)
│   └── TeamStructureEditor.js # Levels + committees + mapping
├── context/
│   └── AuthContext.js         # Firebase auth state + token refresh
└── lib/
    ├── api.js                 # REST API client (centralized)
    ├── authMicrosoft.js       # Microsoft OAuth popup
    └── firebase.js            # Firebase app init
```

## Auth Flow

1. User clicks **"Continue with Microsoft"** on `/login`
2. Firebase handles Microsoft OAuth popup → returns ID token
3. Token sent to backend `/auth/sync` for allowlist check
4. `AuthProvider` manages token state and auto-refreshes before expiry
5. Protected routes redirect to `/login` if unauthenticated

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
