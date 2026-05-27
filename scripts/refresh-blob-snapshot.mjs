// Fetches CRM listings and uploads the snapshot to Vercel Blob. Run by the
// scheduled GitHub Action (.github/workflows/refresh-projects.yml) every 15 min.
// The app reads this Blob (src/lib/content.ts). Requires BLOB_READ_WRITE_TOKEN.

import { put } from '@vercel/blob';
import { fetchAllListings } from './fetch-listings.mjs';

const BLOB_PATH = 'listings-snapshot.json';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN env var.');
  process.exit(1);
}

const listings = await fetchAllListings();

if (listings.length === 0) {
  console.error('CRM returned 0 listings — refusing to overwrite Blob with empty data.');
  process.exit(1);
}

const { url } = await put(BLOB_PATH, JSON.stringify(listings), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

console.log(`Uploaded ${listings.length} listings to Blob: ${url}`);
