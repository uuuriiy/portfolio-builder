# Portfolio Builder

Private portfolio pages for several developers, managed from one admin panel.
Each developer gets an unguessable link (`/p/<token>`); clients only ever see the page whose link they were sent.

- **Public page** `/p/<token>`: hero, projects (with gallery modal), about, contact. Rendered per request, `noindex`.
- **Admin** `/admin`: create developers, edit every text on their page, manage projects and images, publish/hide, copy link, issue a new link (the old one stops working immediately).
- `/`, unknown tokens, hidden pages and revoked links all return 404. `robots.txt` disallows everything.

Stack: Next.js 16 (App Router, Server Actions, Cache Components), Tailwind 4, Drizzle ORM + Postgres, Vercel Blob for images.

## Local development

```bash
cp .env.example .env.local   # set ADMIN_PASSWORD and SESSION_SECRET
npm install
npm run db:migrate           # without DATABASE_URL this uses an embedded PGlite DB in ./.pglite
npm run seed                 # creates the original "Oleh Sypko" portfolio and prints its link
npm run dev
```

PGlite allows one process at a time: stop `npm run dev` before running `db:migrate` or `seed`.
Image uploads need `BLOB_READ_WRITE_TOKEN` (pull it with `vercel env pull .env.local`).

## Deploy to Vercel

1. Import the repo in Vercel.
2. Storage → add **Neon Postgres** (sets `DATABASE_URL`) and a **Blob** store (sets `BLOB_READ_WRITE_TOKEN`).
3. Add `ADMIN_PASSWORD` and `SESSION_SECRET` (`openssl rand -base64 32`) in Project → Settings → Environment Variables.
4. Run migrations against the production DB once (and after every schema change), then seed if you want the original portfolio:
   ```bash
   vercel env pull .env.local
   npm run db:migrate && npm run seed
   ```

## Schema changes

Edit `src/db/schema.ts`, then `npm run db:generate` (writes SQL to `drizzle/`) and `npm run db:migrate`.

## How privacy works

- Links are 24 random URL-safe characters (144 bits), see `src/lib/tokens.ts`.
- `src/proxy.ts` checks the token before the page renders, so wrong/hidden/revoked links get a real 404.
- The public query returns only that developer's profile and projects; admin-only fields (token, internal label) are stripped (`src/lib/data.ts`).
- Every admin page and Server Action re-checks the session (`requireAdmin`), not just the proxy.
