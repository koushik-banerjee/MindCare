# MINDCARE – Digital Psychological Intervention System

A full-stack mental wellness platform built with React, Express, Supabase, and YouTube Data API.

## Tech Stack

- **Frontend:** React + Vite + TypeScript, shadcn/ui, Tailwind CSS, React Query, React Router
- **Backend:** Node.js + Express
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **External API:** YouTube Data API v3 (Resource Hub videos)
- **AI:** OpenAI API (AI Chat)

## Project Structure

```
mindcare/
├── client/                 # React frontend
│   ├── src/
│   │   ├── app/           # Layout, router, providers
│   │   ├── pages/         # Auth, Chat, Booking, Resources, Community, Admin
│   │   ├── components/    # UI components (shadcn), navbar, protected-route
│   │   ├── services/      # Supabase, API, YouTube types
│   │   ├── hooks/
│   │   └── lib/
│   └── tailwind.config.ts
├── server/                 # Express backend
│   └── src/
│       ├── routes/         # auth, chat, booking, resource, community, admin
│       ├── middleware/     # roleAuth
│       ├── supabaseClient.js
│       └── index.js
├── supabase/
│   └── migrations/        # SQL schema
└── README.md
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor
3. Copy your project URL and keys from Settings → API

### 2. Environment Variables

**Client** (`client/.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Server** (`server/.env`):
```
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
YOUTUBE_API_KEY=your-youtube-api-key
```

### 3. OAuth (Google & GitHub)

1. In Supabase Dashboard: **Authentication** → **Providers**
2. Enable **Google** and/or **GitHub**
3. Add redirect URL: `http://localhost:5173/auth/callback` (and your production URL)
4. **Google:** Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application). Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
5. **GitHub:** Create OAuth App at [GitHub Developer Settings](https://github.com/settings/developers). Authorization callback URL: `https://<your-project>.supabase.co/auth/v1/callback`

### 4. YouTube Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable **YouTube Data API v3**
3. Create credentials (API key)
4. Add the key to `server/.env` as `YOUTUBE_API_KEY`

### 5. Install & Run

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Run server (from project root)
cd server && npm run dev

# Run client (from project root)
cd client && npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:5000

The client proxies `/api` to the server.

## Features

### 1. Authentication (Supabase Auth)
- Email/password sign up and login
- OAuth: Sign in with Google, Sign in with GitHub
- Roles: `student`, `consultant`, `admin`
- Role-based protected routes

### 2. AI Chat
- ChatGPT-like UI
- Mental health safety rules (no diagnosis, crisis disclaimer)
- Chat history stored in Supabase
- Crisis keyword detection → escalation message

### 3. Booking System
- Students view consultants and availability
- Book appointments (date + time)
- Consultants approve/reject
- Admin manages all bookings

### 4. Resource Hub (YouTube API)
- Videos fetched via YouTube Data API v3
- Metadata stored in Supabase (no video storage)
- Filters by language and category
- Admin syncs and manages metadata

### 5. Peer Support (Community)
- Thread-style posts and replies
- Paginated feed
- Admin moderation (delete posts)

### 6. Admin Dashboard
- Manage bookings, consultants, community posts
- Manage YouTube resource metadata
- Sync videos from YouTube

## Email Rate Limits

Supabase enforces rate limits on auth (e.g. sign-up, sign-in). If you see "email rate limit exceeded":

- **Wait 5–10 minutes** before trying again
- Use **OAuth (Google/GitHub)** to avoid email-based limits
- On Supabase Pro, limits are higher

## Creating an Admin User

After registering, update the profile in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## Seeding Consultant Availability

For the booking system to work, consultants need availability slots. Add them in Supabase:

```sql
-- Replace CONSULTANT_UUID with a consultant's profile id
INSERT INTO availability (consultant_id, slot_date, slot_time)
VALUES
  ('CONSULTANT_UUID', CURRENT_DATE + 1, '10:00'),
  ('CONSULTANT_UUID', CURRENT_DATE + 1, '11:00'),
  ('CONSULTANT_UUID', CURRENT_DATE + 2, '14:00');
```

## Production Deployment

- **Client:** Build with `npm run build` and deploy to Vercel/Netlify
- **Server:** Deploy to Railway/Render/Fly.io
- Set `CLIENT_URL` to your production frontend URL
- Enable CORS for your production domain

## License

MIT
