// Writes the committed fallback snapshot to src/data/listings-snapshot.json.
// The app prefers the Vercel Blob snapshot (refreshed every 15 min by the
// GitHub Action) and falls back to this committed file when Blob is
// unavailable. Run manually to refresh the fallback: `npm run snapshot:projects`.

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fetchAllListings } from './fetch-listings.mjs';

const OUT = 'src/data/listings-snapshot.json';

const listings = await fetchAllListings();

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
