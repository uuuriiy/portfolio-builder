# Portfolio Builder

Private portfolio pages for several developers, managed from one admin panel.
Each developer gets an unguessable link (`/p/<token>`); clients only ever see the page whose link they were sent.

- **Public page** `/p/<token>`: hero, projects (with gallery modal), about, contact. Rendered per request, `noindex`.
- **Admin** `/admin`: sign in with Google (only approved emails), create developers, edit every text on their page, manage projects and images, publish/hide, copy link, issue a new link (the old one stops working immediately).
- `/`, unknown tokens, hidden pages and revoked links all return 404. `robots.txt` disallows everything.

Stack: Next.js 16 (App Router, Server Actions, Cache Components), Tailwind 4, Drizzle ORM + Postgres, Vercel Blob for images.

## Local development

```bash
cp .env.example .env.local          # set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
npm install
npm run db:migrate                  # without DATABASE_URL this uses an embedded PGlite DB in ./.pglite
npm run admin:add -- you@gmail.com  # the first admin; more can be added in the panel
npm run seed                        # creates the original "Oleh Sypko" portfolio and prints its link
npm run dev
```

PGlite allows one process at a time: stop `npm run dev` before running `db:migrate` or `seed`.
Image uploads need `BLOB_READ_WRITE_TOKEN` (pull it with `vercel env pull .env.local`).

## Google sign-in setup

1. [Google Cloud Console](https://console.cloud.google.com/) → create a project → **APIs & Services → OAuth consent screen**: user type *External*, fill in the app name and your email. Only `email`, `profile` and `openid` scopes are used, so no Google review is needed.
2. **Credentials → Create credentials → OAuth client ID** → *Web application*.
   Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://<your-domain>/api/auth/google/callback` (one per domain you sign in on)
3. Put the client ID and secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

While the consent screen is in *Testing*, only Google accounts listed as test users can sign in. Click **Publish app** to allow any account; access is still limited to the admin list.

## Deploy to Vercel

1. Import the repo in Vercel.
2. Storage → add **Neon Postgres** (sets `DATABASE_URL`) and a **Blob** store (sets `BLOB_READ_WRITE_TOKEN`).
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Project → Settings → Environment Variables (mark them Sensitive).
4. Against the production DB (connection string from the Neon page in Storage), run migrations once and after every schema change, add the first admin, and seed if you want the original portfolio:
   ```bash
   export DATABASE_URL="postgres://..."
   npm run db:migrate
   npm run admin:add -- you@gmail.com
   npm run seed
   ```
5. Redeploy so the new variables are picked up.

## Handing the panel to someone else

In **Security**, add their Google email. Once they have signed in, remove yourself ("Remove me"): your sessions end immediately and you can no longer sign in.

## Schema changes

Edit `src/db/schema.ts`, then `npm run db:generate` (writes SQL to `drizzle/`) and `npm run db:migrate`.

## How privacy works

- Links are 24 random URL-safe characters (144 bits), see `src/lib/tokens.ts`.
- `src/proxy.ts` checks the token before the page renders, so wrong/hidden/revoked links get a real 404.
- The public query returns only that developer's profile and projects; admin-only fields (token, internal label) are stripped (`src/lib/data.ts`).
- Every admin page, Server Action and Route Handler re-checks the session (`requireAdmin`), not just the proxy.

## How admin sign-in works

- No passwords. Google verifies the account; the app only checks that the verified email is in the `admins` table. 2FA is whatever the Google account has.
- Sessions live in the database. The cookie holds a random 256-bit token; only its SHA-256 is stored, so a database leak can't be replayed as a login. Sessions end after 12 hours idle or 7 days total, and can be ended individually or all at once in **Security**.
- Sign-in attempts are rate limited per IP (20 per 10 minutes), stored in Postgres (`src/lib/rate-limit.ts`).
- OAuth uses `state` and PKCE; the ID token's issuer, audience, expiry and `email_verified` are checked (`src/app/api/auth/google/callback/route.ts`).
