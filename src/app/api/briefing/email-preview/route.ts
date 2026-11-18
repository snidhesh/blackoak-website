// Reviewer's preview of the next Monday email, before the edition is published.
//
//   POST   { "edition": "011", "date": "2026-11-23", "content": { ...email.json } }
//          with `Authorization: Bearer <BRIEFING_NOTIFY_SECRET>`. Called by the
//          Briefing repository's workflow whenever the edition's pull request
//          changes. Stores the content and answers with the preview link.
//   GET    ?e=011&k=<key>   the email exactly as subscribers would get it, rendered
//          from the content stored last. The key is a signature over the edition
//          number, so the link on the pull request stays the same while the figures
//          are updated, and nobody without the link can read an unpublished edition.
//
// Nothing here sends email. The Monday send reads the live edition's email.json
// again (src/app/api/briefing/notify), so the preview shows what will go out only
// as long as the pull request is merged as previewed.

import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BRIEFING_PUBLIC_ORIGIN } from '@/lib/constants';
import { BRIEFING_PATH } from '@/lib/briefing-proxy';
import { createEmailPreviewKey, verifyEmailPreviewKey } from '@/lib/briefing-link';
import { editionDateLabel, renderEditionEmail } from '@/lib/briefing-edition-email';
import { editionEmailSchema } from '@/lib/briefing-email-data';
import { loadEmailPreview, saveEmailPreview } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MIN_SECRET_LENGTH = 32;
const PREVIEW_PATH = '/api/briefing/email-preview/';

const editionPattern = /^\d{3}$/;
const storedSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: editionEmailSchema,
});
const bodySchema = storedSchema.extend({ edition: z.string().regex(editionPattern) });

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function notice(message: string, status: number) {
  return new NextResponse(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}

// Hashing both sides first gives timingSafeEqual equal lengths whatever was sent.
function authorized(request: NextRequest): boolean {
  const secret = process.env.BRIEFING_NOTIFY_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return false;
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return false;
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(header.slice(7)), digest(secret));
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return json({ success: false, error: 'unauthorized' }, 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return json({ success: false, error: `invalid body at ${issue?.path.join('.') || 'root'}: ${issue?.message ?? 'unknown'}` }, 400);
  }
  const { edition, date, content } = parsed.data;
  if (Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())) return json({ success: false, error: 'invalid date' }, 400);

  const key = await createEmailPreviewKey(edition);
  if (!key) {
    console.error('[api/briefing/email-preview] INTEL_ACCESS_SECRET is missing or too short');
    return json({ success: false, error: 'link signing not configured' }, 500);
  }
  try {
    if (!(await saveEmailPreview(edition, { date, content }))) {
      return json({ success: false, error: 'Upstash is not configured; the preview cannot be stored' }, 503);
    }
  } catch (error) {
    console.error('[api/briefing/email-preview] Could not store the preview:', error);
    return json({ success: false, error: 'could not store the preview' }, 503);
  }
  return json({ success: true, edition, url: `${BRIEFING_PUBLIC_ORIGIN}${PREVIEW_PATH}?e=${edition}&k=${key}` });
}

export async function GET(request: NextRequest) {
  const edition = request.nextUrl.searchParams.get('e') ?? '';
  const key = request.nextUrl.searchParams.get('k');
  if (!editionPattern.test(edition) || !(await verifyEmailPreviewKey(edition, key))) {
    return notice('This preview link is not valid.', 404);
  }

  let stored: unknown;
  try {
    stored = await loadEmailPreview(edition);
  } catch (error) {
    console.error('[api/briefing/email-preview] Could not load the preview:', error);
    return notice('The preview could not be loaded. Please try again shortly.', 503);
  }
  const parsed = storedSchema.safeParse(stored);
  if (!parsed.success) return notice(`No email preview is stored for edition ${edition}.`, 404);

  // A reviewer has no personal link: the button and the footer links lead to the
  // public Briefing address, and nothing in the preview can unsubscribe anyone.
  const briefing = `${BRIEFING_PUBLIC_ORIGIN}${BRIEFING_PATH}/`;
  const { html } = renderEditionEmail({
    edition,
    dateLabel: editionDateLabel(new Date(`${parsed.data.date}T00:00:00Z`)),
    link: briefing,
    unsubscribeLink: briefing,
    content: parsed.data.content,
  });
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
