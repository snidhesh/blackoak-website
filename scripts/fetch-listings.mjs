// Shared CRM fetch + sanitize used by the snapshot scripts.

const PAGE_LIMIT = 50;
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

// The CRM returns some images as multi-MB base64 data URIs that the app
// discards anyway; strip them so snapshots stay small (~2MB vs ~50MB).
export function sanitize(listing) {
  if (Array.isArray(listing.images)) {
    listing.images = listing.images.filter(
      (img) => typeof img === 'string' && !img.startsWith('data:')
    );
  }
  if (listing.agent?.profileImage?.startsWith?.('data:')) {
    listing.agent.profileImage = '';
  }
  return listing;
}

async function fetchPage(base, key, page) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${base}/api/v1/public/listings?page=${page}&limit=${PAGE_LIMIT}`,
      { headers: { 'X-API-Key': key }, signal: controller.signal }
    );
    if (!res.ok) throw new Error(`CRM API ${res.status} ${res.statusText}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPageWithRetry(base, key, page) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchPage(base, key, page);
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      console.warn(`page ${page} attempt ${attempt} failed: ${err.message} — retrying`);
    }
  }
}

export async function fetchAllListings() {
  const base = process.env.CRM_API_BASE_URL;
  const key = process.env.CRM_API_KEY;
  if (!base || !key) throw new Error('Missing CRM_API_BASE_URL or CRM_API_KEY env vars.');

  const all = [];
  let page = 1;
  while (true) {
    const res = await fetchPageWithRetry(base, key, page);
    all.push(...res.data.map(sanitize));
    const totalPages = Math.ceil(res.total / res.limit) || 1;
    console.log(`fetched page ${page}/${totalPages} (${all.length} listings so far)`);
    if (page >= totalPages) break;
    page++;
  }
  return all;
}
