// Refreshes the committed fallback (src/data/listings-snapshot.json) from the
// public Blob snapshot, so the copy bundled into a deployment is as fresh as
// the deployment itself. The site only serves this file when the Blob cannot
// be read at all (src/lib/content.ts).
//
// Runs as `prebuild`, on Vercel builds only: a local `npm run build` should not
// rewrite a tracked file. It never fails the build — on any problem it keeps
// the committed file.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SNAPSHOT_URL =
  process.env.PROJECTS_SNAPSHOT_URL ??
  'https://w3lbfhke8nf2vtpc.public.blob.vercel-storage.com/listings-snapshot.json';
const TARGET = fileURLToPath(new URL('../src/data/listings-snapshot.json', import.meta.url));

if (!process.env.VERCEL && !process.argv.includes('--force')) {
  console.log('[fallback-snapshot] Not a Vercel build, keeping the committed fallback.');
  process.exit(0);
}

try {
  const res = await fetch(`${SNAPSHOT_URL}?v=${Date.now()}`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const listings = await res.json();
  if (!Array.isArray(listings) || listings.length === 0) throw new Error('empty or malformed snapshot');
  await writeFile(TARGET, JSON.stringify(listings));
  console.log(`[fallback-snapshot] Wrote ${listings.length} listings to the fallback.`);
} catch (error) {
  console.warn('[fallback-snapshot] Could not refresh, keeping the committed fallback:', error.message);
}
