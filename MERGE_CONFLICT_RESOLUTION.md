# Merge conflict resolution guide

This branch previously conflicted on:
- `netlify.toml`
- `package.json`
- `tools/check-env.mjs`

Use these as the source-of-truth resolutions.

## netlify.toml
Keep Next.js plugin and pre-build checks:

```toml
[build]
  command = "npm run check:netlify-base && npm run check:env && npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## package.json scripts
Retain all of these scripts together (do not drop any during merge):
- `build:full`
- `check:netlify-base`
- `check:env`
- `smoke`

If another branch adds scripts, append them without removing the above.

## tools/check-env.mjs
Keep the current context-aware behavior:
- strict/failing for `CONTEXT=production`
- strict/failing when `REQUIRE_STRICT_ENV=1`
- warning-only in preview/local

This prevents preview deploy failures while still enforcing production requirements.

## Post-merge verification
Run these commands after resolving conflicts:

1. `npm run check:netlify-base`
2. `node tools/check-env.mjs`
3. `npm run build`
4. `npm start` and in another shell `npm run smoke`
