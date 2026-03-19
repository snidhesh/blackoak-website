import type { CrmListing, CrmListResponse } from '@/types/crm';

const CRM_API_BASE_URL = process.env.CRM_API_BASE_URL ?? '';
const CRM_API_KEY = process.env.CRM_API_KEY ?? '';

async function crmFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${CRM_API_BASE_URL}${path}`, {
      headers: { 'X-API-Key': CRM_API_KEY },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`CRM API ${res.status}: ${res.statusText} for ${path}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`CRM API timeout after 10s for ${path}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAllListings(): Promise<CrmListing[]> {
  const all: CrmListing[] = [];
  let page = 1;
  const limit = 50;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await crmFetch<CrmListResponse>(
      `/api/v1/public/listings?page=${page}&limit=${limit}`
    );

    all.push(...res.data);

    const totalPages = Math.ceil(res.total / res.limit) || 1;
    if (page >= totalPages) break;
    page++;
  }

  return all;
}
