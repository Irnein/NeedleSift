# NeedleSift frontend

Next.js (App Router) + React + TypeScript + Tailwind CSS 4. Two routes:

- `/` — public landing page. Static; makes no API calls.
- `/dashboard` — security operations dashboard. No authentication. Talks to the NeedleSift API.

The app is built as a **static export** (`output: "export"`), so `npm run build` writes plain files to `out/`.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

`NEXT_PUBLIC_API_BASE_URL` selects the API:

| Value | Meaning |
| --- | --- |
| unset (dev) | `http://localhost:8080`, the backend run with uvicorn (see `../DEPLOY.md`) |
| unset (production build) | same origin, because the backend container serves this frontend |
| a URL | that backend, e.g. the deployed Cloud Run service (CORS allows localhost only) |

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Structure

```
src/app/                 routes, layouts, design tokens (globals.css)
src/components/ui/       button, dialog, tooltip (Radix based)
src/components/shared/   logo, theme toggle/provider, severity badge
src/features/landing/    landing page sections
src/features/dashboard/  dashboard shell, queue, investigation, digest, hooks
src/lib/api/             Zod schemas and the single API client
src/lib/limiter.ts       concurrency limiter (triage is capped at 2 in flight)
```
