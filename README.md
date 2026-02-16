# Project AURA

Next.js (App Router) landing page for AURA Toolbox.

## Dev

```bash
npm install
npm run dev
```

### Required env for auth

Add this to `.env.local`:

```bash
AUTH_SECRET=put-a-random-secret-at-least-32-characters
```

Without `AUTH_SECRET`, member login/session routes will fail.

### Recommended for production auth persistence

For Vercel/serverless, set:

```bash
AUTH_USERS_STORE=r2
# optional (default: auth/users.json)
AUTH_USERS_KEY=auth/users.json
```

This stores users in R2 instead of ephemeral local disk.

## Deploy to Vercel (Recommended)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, click **New Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build`
5. Output: leave empty (Vercel handles Next.js).
6. Deploy.

Optional: if you want previews on every PR, enable Vercel Git integration.
