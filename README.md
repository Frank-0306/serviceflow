# ServiceFlow — BrightNest Cleaning (portfolio demo)

A marketing site and booking flow for **BrightNest Cleaning**, a fictional residential cleaning company in the US. Visitors compare services, build an itemized estimate and send a service request. Phase 2 adds a private admin panel on Supabase.

> **Demo notice.** BrightNest is not a real business. Prices, policies, phone numbers (reserved 555-01xx range) and email addresses (`.example` domain) are placeholders. There are no reviews, awards, certifications, addresses or statistics on the site, by design.

## Stack

- Next.js (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (CSS-first tokens in `src/app/globals.css`)
- Zod for validation on both client and server
- Prepared for Supabase (Phase 2) and Vercel

## Run it locally

Requires Node.js 20.9 or newer and, for the request form and admin panel, a Supabase project (see Phase 2 below).

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit tests for pricing and validation
npm run typecheck    # TypeScript, no emit
npm run build        # production build (also type-checks)
```

Copy `.env.example` to `.env.local` and fill in the Supabase values. Without them the public site still works, the request form answers with a clear "unavailable" message, and `/admin` shows setup instructions.

## Project structure

```
src/
  app/                    routes (App Router)
    page.tsx              homepage
    services/             service index and /services/[slug]
    quote/                estimate + request flow
    faq/  contact/        content pages
    api/requests/         POST: validate, re-price on the server, store
    api/contact/          POST: validate contact messages
    sitemap.ts robots.ts  SEO
    loading.tsx error.tsx not-found.tsx
  components/             layout, ui, forms, quote, home
  config/pricing.ts       ALL demo prices and limits (amounts in cents)
  config/site.ts          name, contact details, hours, navigation
  content/                services and FAQ copy
  lib/quote.ts            pure pricing engine used by client and server
  lib/validation.ts       Zod schemas
  lib/repositories/       storage boundary (Supabase, secret key, server only)
  lib/supabase/           env, session client, secret client
  lib/admin/              auth guard, queries, stats, formatting
  app/admin/              login, overview, requests, detail, server actions
  proxy.ts                session refresh + /admin redirect
tests/                    pricing, validation and dashboard statistics tests
supabase/migrations/      schema, RLS, triggers
supabase/seed-demo.sql    optional fictional demo data
```

## Changing prices

Edit `src/config/pricing.ts`. The calculator, the "From $X" prices and the server-side estimate all read from it. Run `npm test` afterwards; two tests check exact amounts and will tell you if the starting price changed.

## Replacing placeholder photos

Photo areas use `PhotoSlot`, which renders a labeled stand-in and a description of the intended shot. To use real photography:

1. Get images you're licensed to use (your own shoot, or a source whose license allows commercial use, e.g. Unsplash/Pexels, keeping a record of each photo's page).
2. Put them in `public/images/`.
3. Replace `<PhotoSlot … />` with `next/image`, reusing the `alt` text already written for each slot.

## What's implemented (Phase 1)

- Homepage with a live estimator in the hero that hands its numbers to `/quote`
- Services index and four service pages (statically generated)
- Estimate flow: service, rooms or restrooms, size, condition, frequency, add-ons, line-by-line breakdown, minimum charge, recurring discount, labor-time estimate
- Request form with client and server validation, error summary, US phone formatting, honeypot, basic rate limit, focus management
- FAQ (native accordions + FAQPage JSON-LD) and contact page with form
- Responsive navigation with accessible mobile menu
- Metadata per page, canonical URLs, sitemap, robots, security headers
- Loading, error, 404 and confirmation states; reduced-motion support

## Phase 2: admin panel and Supabase

### What it does

- `/admin/login`: email and password sign-in (Supabase Auth). There is no public sign-up.
- `/admin`: live metrics from stored data (requests in the last 30 days compared with the previous 30, requests awaiting first contact, open pipeline value, completed value, average estimate), requests per day, breakdowns by status and service, and the latest requests.
- `/admin/requests`: status tabs with counts, search (name, email, phone, reference, ZIP), service and date filters, sorting, pagination. Filters live in the URL.
- `/admin/requests/[id]`: full details, estimate breakdown, status change (cancellation asks for confirmation), internal notes, and a status history.

### Security model

| Layer | What it enforces |
|---|---|
| `src/proxy.ts` | No session → redirect to `/admin/login`. Refreshes the session cookie. |
| `src/app/admin/(panel)/layout.tsx` | The user must be listed in `public.admins`, verified on the server with `getUser()`. |
| Server actions | Each one re-checks admin access and validates input with Zod. |
| Postgres RLS + grants | `anon` has no access to any table. Authenticated users can read data only if they are admins, and can update only `status` and `admin_notes`. No one can delete through the API. |
| Secret key | Used only in `/api/requests` (`src/lib/supabase/secret.ts`, guarded by `server-only`) to insert validated requests. Prices are recalculated on the server. |

### Supabase setup

1. Create a project at supabase.com.
2. **SQL Editor → New query**: paste `supabase/migrations/20261119000000_initial_schema.sql` and click **Run**.
3. Optional: run `supabase/seed-demo.sql` to load fictional demo rows (tagged `demo-seed`).
4. **Authentication → Sign In / Providers**: turn off **Allow new users to sign up**. Keep Email enabled.
5. **Authentication → Users → Add user → Create new user**: enter an email and password and tick **Auto Confirm User**. Copy the user's UID.
6. **SQL Editor**: `insert into public.admins (user_id) values ('PASTE-UID-HERE');`
7. **Project Settings → API Keys**: copy the publishable key and the secret key. The URL is under **Data API** (or the project's Connect dialog).
8. Rename `.env.local.template` to `.env.local`, fill it in, and restart `npm run dev`.

### Environment variables

| Variable | Where it's used | Exposed to the browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients | Yes (safe) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Session client in `proxy.ts` and server components/actions | Yes (safe, RLS applies) |
| `SUPABASE_SECRET_KEY` | `src/lib/supabase/secret.ts` → `/api/requests` only | **No, never** |
| `NEXT_PUBLIC_SITE_URL` | Metadata, sitemap | Yes |

The legacy names `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are also accepted.

On Vercel, add the same variables under **Project → Settings → Environment Variables**, then redeploy.

### Security notes

- Security headers in `next.config.ts`: `X-Frame-Options`, `frame-ancestors 'none'`, `nosniff`, HSTS, a strict referrer policy, and a restrictive `Permissions-Policy`. A full `script-src` CSP needs per-request nonces with Next.js; it isn't enabled yet.
- All input is validated with Zod on the server. Dates must be real calendar dates between tomorrow and 12 months ahead. Request bodies are capped at 10 KB.
- In local development only, `/api/requests` includes the technical error in a failed response to make setup problems visible. Production responses never include it.

### Known limits

- The rate limiter is in memory per server instance. For production traffic, use a shared store (for example Upstash Redis).
- Contact-page messages are validated but not stored or emailed.
- No email notifications yet; admins see new requests in the panel.
- Dashboard statistics aggregate up to 10,000 rows in the app. Beyond that, move aggregation into a SQL view.

## Deploying to Vercel

1. Push the repository to GitHub. `.env.local` is ignored, so keys stay on your machine.
2. On vercel.com: **Add New → Project → Import** the repository. Vercel detects Next.js; keep the defaults.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL, e.g. `https://serviceflow.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (keep it scoped to Production and Preview; never expose it client-side)
4. Click **Deploy**. After it finishes, test `/quote`, then sign in at `/admin` and confirm the request is there.
5. If you change an environment variable later, redeploy so it takes effect.

## Quality checks

```bash
npm test           # pricing, validation and dashboard statistics
npm run typecheck  # TypeScript, strict
npm run build      # production build
```
