import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { fetchAllListings } from '@/lib/crm';
import { sanitizeListing } from '@/lib/crm-transform';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SNAPSHOT_BLOB_PATH = 'listings-snapshot.json';

export async function GET(request: Request) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const listings = (await fetchAllListings()).map(sanitizeListing);

    if (listings.length === 0) {
      // Don't overwrite a good snapshot with an empty one if the CRM hiccups.
      return NextResponse.json({ ok: false, reason: 'CRM returned 0 listings' }, { status: 502 });
    }

    const { url } = await put(SNAPSHOT_BLOB_PATH, JSON.stringify(listings), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });

    return NextResponse.json({ ok: true, count: listings.length, url });
  } catch (error) {
    console.error('[cron/refresh-projects] failed:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
