#!/usr/bin/env node

const context = process.env.CONTEXT || 'local';
const isProductionDeploy = context === 'production';
const strictMode = process.env.REQUIRE_STRICT_ENV === '1';

const REQUIRED_PRODUCTION = ['NEXTAUTH_SECRET', 'DATABASE_URL', 'OPENAI_API_KEY'];
const RECOMMENDED_PREVIEW = ['NEXTAUTH_SECRET', 'DATABASE_URL', 'OPENAI_API_KEY'];

function missingVars(names) {
  return names.filter((name) => {
    const value = process.env[name];
    return !value || value.trim().length === 0;
  });
}

if (isProductionDeploy || strictMode) {
  const missing = missingVars(REQUIRED_PRODUCTION);
  if (missing.length > 0) {
    console.error('Environment validation failed.');
    console.error(`Missing required variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('Environment validation passed (strict mode).');
  process.exit(0);
}

const missingRecommended = missingVars(RECOMMENDED_PREVIEW);
if (missingRecommended.length > 0) {
  console.warn('Environment validation warning (non-blocking).');
  console.warn(`Missing recommended variables for preview/local: ${missingRecommended.join(', ')}`);
  console.warn('Set REQUIRE_STRICT_ENV=1 to enforce these as required in non-production contexts.');
} else {
  console.log('Environment validation passed.');
}
