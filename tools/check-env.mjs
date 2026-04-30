#!/usr/bin/env node

const REQUIRED_ALWAYS = ['NEXTAUTH_SECRET'];
const REQUIRED_FOR_PROD = ['DATABASE_URL', 'OPENAI_API_KEY'];

const isProdLike =
  process.env.NODE_ENV === 'production' ||
  process.env.CONTEXT === 'production' ||
  process.env.CONTEXT === 'deploy-preview';

const required = isProdLike
  ? [...REQUIRED_ALWAYS, ...REQUIRED_FOR_PROD]
  : REQUIRED_ALWAYS;

const missing = required.filter((name) => {
  const value = process.env[name];
  return !value || value.trim().length === 0;
});

if (missing.length > 0) {
  console.error('Environment validation failed.');
  console.error(`Missing required variables: ${missing.join(', ')}`);
  console.error(
    isProdLike
      ? 'Set these in Netlify site settings before deploying.'
      : 'Set these in your local .env before running production-like checks.'
  );
  process.exit(1);
}

console.log('Environment validation passed.');
console.log(`Checked vars: ${required.join(', ')}`);
