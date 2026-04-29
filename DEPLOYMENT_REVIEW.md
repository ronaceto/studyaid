# Deployment review (Netlify)

## Findings

1. **Netlify build command was running database migrations during every build** (`npx prisma migrate deploy`).
   - This can fail if `DATABASE_URL` is missing or if DB connectivity is transient.
   - It also introduces side effects during build and can block otherwise-valid frontend deploys.

2. **Netlify config had manual redirects and publish settings for Next.js plugin deployment**.
   - With `@netlify/plugin-nextjs`, Netlify handles routing and output automatically.
   - Manual `publish = ".next"` and catch-all redirects can conflict with plugin-managed behavior.

3. **Build can fail when Google Fonts fetch is unavailable at build time**.
   - The app imported `Inter` from `next/font/google`, which requires fetching from Google during build.
   - In restricted or flaky network contexts, this throws a fatal `next/font` build error.

## Changes made

- Updated `netlify.toml` to keep deployment deterministic:
  - build command now only runs `npm run build`
  - removed `publish` override and custom redirects
  - kept Next.js plugin and function bundling config
- Updated `app/layout.tsx` to remove runtime dependency on Google Fonts fetch during build.

## Recommendations

1. Trigger a **clean redeploy** in Netlify using "Clear cache and deploy site".
2. Confirm required environment variables exist in Netlify:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `OPENAI_API_KEY`
   - any Supabase env vars used by your project
3. Run schema migrations in a controlled release step (CI or manual), not inside every Netlify build.
4. After redeploy, test these routes:
   - `/`
   - `/student`
   - `/library`
   - `/quick-quiz`
   - one API endpoint, e.g. `/api/ping`

