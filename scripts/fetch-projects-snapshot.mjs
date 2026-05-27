// Fetches all listings from the CRM and writes a raw snapshot to
// src/data/listings-snapshot.json. The app reads this committed file at
// runtime instead of calling the CRM per request. Refreshed on a schedule
// (see .github/workflows/refresh-projects.yml) and on every deploy.

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const BASE = process.env.CRM_API_BASE_URL;
const KEY = process.env.CRM_API_KEY;
const OUT = 'src/data/listings-snapshot.json';
const PAGE_LIMIT = 50;
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

if (!BASE || !KEY) {
  console.error('Missing CRM_API_BASE_URL or CRM_API_KEY env vars.');
  process.exit(1);
}

async function fetchPage(page) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${BASE}/api/v1/public/listings?page=${page}&limit=${PAGE_LIMIT}`,
      { headers: { 'X-API-Key': KEY }, signal: controller.signal }
    );
    if (!res.ok) throw new Error(`CRM API ${res.status} ${res.statusText}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPageWithRetry(page) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchPage(page);
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      console.warn(`page ${page} attempt ${attempt} failed: ${err.message} — retrying`);
    }
  }
}

// The CRM returns some images as multi-MB base64 data URIs. The app discards
// them (resolveImageUrl falls back to a placeholder), so strip them here to
// keep the committed snapshot small instead of bloating it to ~50MB.
function sanitize(listing) {
  if (Array.isArray(listing.images)) {
    listing.images = listing.images.filter(
      (img) => typeof img === 'string' && !img.startsWith('data:')
    );
  }
  if (listing.agent?.profileImage?.startsWith?.('data:')) {
    listing.agent.profileImage = null;
  }
  return listing;
}

async function fetchAll() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await fetchPageWithRetry(page);
    all.push(...res.data.map(sanitize));
    const totalPages = Math.ceil(res.total / res.limit) || 1;
    console.log(`fetched page ${page}/${totalPages} (${all.length} listings so far)`);
    if (page >= totalPages) break;
    page++;
  }
  return all;
}

const listings = await fetchAll();

if (listings.length === 0) {
  console.error('CRM returned 0 listings — refusing to overwrite snapshot with empty data.');
  process.exit(1);
}

await mkdir(dirname(OUT), { recursive: true });

let previousCount = null;
try {
  previousCount = JSON.parse(await readFile(OUT, 'utf8')).length;
} catch {
  // no existing snapshot
}

await writeFile(OUT, JSON.stringify(listings));
console.log(
  `Wrote ${listings.length} listings to ${OUT}` +
    (previousCount !== null ? ` (was ${previousCount})` : '')
);
