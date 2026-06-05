// Shared CRM fetch + sanitize used by the snapshot scripts.

import { put } from '@vercel/blob';
import { Buffer } from 'node:buffer';

const PAGE_LIMIT = 50;
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

// The CRM returns some listing images as multi-MB base64 data URIs that the
// app discards anyway (resolveImageUrl); strip them so the snapshot stays
// small (~2MB vs ~50MB). Agent profile images are handled separately by
// uploadAgentImagesToBlob — we keep them on the listing for that pass.
export function sanitize(listing) {
  if (Array.isArray(listing.images)) {
    listing.images = listing.images.filter(
      (img) => typeof img === 'string' && !img.startsWith('data:')
    );
  }
  return listing;
}

const DATA_URI_RE = /^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/;

// Uploads unique agent profile images to Vercel Blob and replaces the
// per-listing base64 with a stable Blob URL (deduped by agent id). Avoids
// (a) bloating the committed snapshot with base64 (~30MB) and (b) breaking
// next/image, which can't optimize data: URIs.
export async function uploadAgentImagesToBlob(listings, token) {
  if (!token) return listings;
  const cache = new Map(); // agentId -> Blob URL (or null on failure)

  for (const listing of listings) {
    const agent = listing.agent;
    if (!agent) continue;
    const img = agent.profileImage;
    if (typeof img !== 'string' || !img.startsWith('data:')) continue;

    const cacheKey = agent.id || `name:${agent.name}`;
    if (cache.has(cacheKey)) {
      agent.profileImage = cache.get(cacheKey);
      continue;
    }

    const match = img.match(DATA_URI_RE);
    if (!match) {
      cache.set(cacheKey, null);
      agent.profileImage = null;
      continue;
    }

    const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    const buffer = Buffer.from(match[2], 'base64');
    const safeId = String(cacheKey).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
    const pathname = `agents/${safeId}.${ext}`;

    try {
      const { url } = await put(pathname, buffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: `image/${match[1].toLowerCase()}`,
        token,
      });
      cache.set(cacheKey, url);
      agent.profileImage = url;
      console.log(`uploaded agent image: ${agent.name} -> ${url}`);
    } catch (err) {
      console.warn(`failed to upload agent image for ${agent.name}: ${err.message}`);
      cache.set(cacheKey, null);
      agent.profileImage = null;
    }
  }

  return listings;
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
