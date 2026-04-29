#!/usr/bin/env node
import { access } from 'node:fs/promises';
import path from 'node:path';

const requiredPaths = ['package.json', 'next.config.js', 'app'];
const baseDir = process.env.NETLIFY_BASE_DIR || process.cwd();

async function pathExists(relativePath) {
  try {
    await access(path.join(baseDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

const missing = [];
for (const target of requiredPaths) {
  // eslint-disable-next-line no-await-in-loop
  if (!(await pathExists(target))) {
    missing.push(target);
  }
}

if (missing.length > 0) {
  console.error(`Netlify base directory check failed: ${baseDir}`);
  console.error(`Missing required paths: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Netlify base directory check passed: ${baseDir}`);
console.log(`Found: ${requiredPaths.join(', ')}`);
