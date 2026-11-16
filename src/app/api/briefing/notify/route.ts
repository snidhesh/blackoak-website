// Sends the Monday "new edition" email to every subscriber.
//
// Called by the Briefing repository's publish workflow once the new edition is
// live, with `Authorization: Bearer <BRIEFING_NOTIFY_SECRET>` and a JSON body:
//
//   { "edition": "010", "date": "2026-11-16" }            send to all subscribers
//   { ..., "dryRun": true }                               count recipients, send nothing
//   { ..., "testTo": "someone@example.com" }              send one email to that address only
//
// Subscribers are the Resend contacts that /api/newsletter/verify files (the
// RESEND_SEGMENT_ID segment when one is set), minus anyone unsubscribed. Each one
// gets their own email with a personal link (src/lib/briefing-link.ts). An edition
// is sent once: a second call for the same date is refused, so re-running the
// workflow cannot email everyone twice.

import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Resend, type Contact } from 'resend';
import { z } from 'zod';
import {
  BRIEFING_LINK_PARAM,
  BRIEFING_LINK_TTL_MS,
  BRIEFING_PUBLIC_ORIGIN,
  BRIEFING_UNSUBSCRIBE_PATH,
} from '@/lib/constants';
import { BRIEFING_PATH } from '@/lib/briefing-proxy';
import { createLinkToken, createUnsubscribeToken, normalizeEmail } from '@/lib/briefing-link';
import { renderEditionEmail } from '@/lib/briefing-edition-email';
import { claimEditionSend, releaseEditionSend } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MIN_SECRET_LENGTH = 32;
const PAGE_SIZE = 100; // Resend's maximum for both listing contacts and batch sending
const MAX_PAGES = 200;
const PAUSE_MS = 600; // Resend allows two requests a second

const bodySchema = z.object({
  edition: z.string().regex(/^\d{3}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dryRun: z.boolean().optional(),
  testTo: z.string().email().max(254).optional(),
});

interface Recipient {
  email: string;
  firstName: string | null;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
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

// "Monday 16 November 2026", built from parts so the wording does not depend on
// which ICU version the runtime ships.
function dateLabel(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('weekday')} ${part('day')} ${part('month')} ${part('year')}`;
}

async function listSubscribers(resend: Resend): Promise<Recipient[]> {
  const segmentId = process.env.RESEND_SEGMENT_ID?.trim();
  const seen = new Set<string>();
  const recipients: Recipient[] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    if (page > 0) await pause(PAUSE_MS);
    const { data, error } = await resend.contacts.list({
      limit: PAGE_SIZE,
      ...(after ? { after } : {}),
      ...(segmentId ? { segmentId } : {}),
    });
    if (error || !data) throw new Error(`Could not list subscribers: ${error?.message ?? 'no data'}`);

    for (const contact of data.data as Contact[]) {
      const email = normalizeEmail(contact.email ?? '');
      if (!email || contact.unsubscribed || seen.has(email)) continue;
      seen.add(email);
      recipients.push({ email, firstName: contact.first_name });
    }

    if (!data.has_more || data.data.length === 0) return recipients;
    after = data.data[data.data.length - 1].id;
  }
  throw new Error('Subscriber list did not end; stopped rather than send to a partial list');
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return json({ success: false, error: 'unauthorized' }, 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ success: false, error: 'invalid body' }, 400);
  const { edition, date, dryRun, testTo } = parsed.data;

  const released = new Date(`${date}T00:00:00Z`);
  const linkExp = released.getTime() + BRIEFING_LINK_TTL_MS;
  if (Number.isNaN(released.getTime()) || linkExp <= Date.now()) {
    return json({ success: false, error: 'edition date is invalid or too old to send' }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BRIEFING_EMAIL_FROM || process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.error('[api/briefing/notify] Missing RESEND_API_KEY or EMAIL_FROM');
    return json({ success: false, error: 'email not configured' }, 500);
  }
  const resend = new Resend(apiKey);

  let recipients: Recipient[];
  try {
    recipients = testTo ? [{ email: normalizeEmail(testTo), firstName: null }] : await listSubscribers(resend);
  } catch (error) {
    console.error('[api/briefing/notify]', error);
    return json({ success: false, error: 'could not list subscribers' }, 502);
  }

  if (dryRun) return json({ success: true, dryRun: true, edition, date, recipients: recipients.length });
  if (recipients.length === 0) return json({ success: true, edition, date, recipients: 0, sent: 0, failed: 0 });

  // One send per edition. A test send to a single address is not the edition send.
  const lockKey = `${date}`;
  if (!testTo) {
    let claim: Awaited<ReturnType<typeof claimEditionSend>>;
    try {
      claim = await claimEditionSend(lockKey);
    } catch (error) {
      console.error('[api/briefing/notify] Could not record the edition send:', error);
      return json({ success: false, error: 'could not record the send' }, 503);
    }
    if (claim === 'sent') return json({ success: false, alreadySent: true, edition, date }, 409);
    if (claim === 'skipped' && process.env.NODE_ENV === 'production') {
      return json({ success: false, error: 'Upstash is not configured; refusing to send without the once-per-edition lock' }, 503);
    }
  }

  const dateText = dateLabel(released);
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let start = 0, batch = 0; start < recipients.length; start += PAGE_SIZE, batch++) {
    if (batch > 0) await pause(PAUSE_MS);
    const chunk = recipients.slice(start, start + PAGE_SIZE);

    const emails = [];
    for (const recipient of chunk) {
      const [linkToken, unsubscribeToken] = await Promise.all([
        createLinkToken(recipient.email, linkExp),
        createUnsubscribeToken(recipient.email),
      ]);
      if (!linkToken || !unsubscribeToken) {
        if (!testTo && sent === 0) await releaseEditionSend(lockKey).catch(() => undefined);
        console.error('[api/briefing/notify] INTEL_ACCESS_SECRET is missing or too short');
        return json({ success: false, error: 'link signing not configured', sent, failed }, 500);
      }
      const link = `${BRIEFING_PUBLIC_ORIGIN}${BRIEFING_PATH}/?${BRIEFING_LINK_PARAM}=${linkToken}`;
      const unsubscribeLink = `${BRIEFING_PUBLIC_ORIGIN}${BRIEFING_UNSUBSCRIBE_PATH}?u=${unsubscribeToken}`;
      const email = renderEditionEmail({ edition, dateLabel: dateText, firstName: recipient.firstName, link, unsubscribeLink });
      emails.push({
        from,
        to: recipient.email,
        ...email,
        headers: {
          'List-Unsubscribe': `<${unsubscribeLink}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: [{ name: 'category', value: 'briefing-edition' }],
      });
    }

    try {
      // Permissive: one malformed address fails alone instead of sinking its batch.
      // The idempotency key makes a retried batch a no-op at Resend for 24 hours.
      const { data, error } = await resend.batch.send(emails, {
        batchValidation: 'permissive',
        idempotencyKey: `briefing-edition/${date}/${testTo ? `test-${Date.now()}` : batch}`,
      });
      if (error || !data) {
        failed += chunk.length;
        errors.push(`batch ${batch}: ${error?.message ?? 'no data'}`);
        continue;
      }
      const rejected = data.errors?.length ?? 0;
      sent += chunk.length - rejected;
      failed += rejected;
      for (const e of data.errors ?? []) errors.push(`batch ${batch} #${e.index}: ${e.message}`);
    } catch (error) {
      failed += chunk.length;
      errors.push(`batch ${batch}: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  if (errors.length > 0) console.error('[api/briefing/notify] Send errors:', errors.slice(0, 20));

  // Nothing went out at all: give the edition back so the workflow can be re-run.
  if (sent === 0 && !testTo) await releaseEditionSend(lockKey).catch(() => undefined);

  const body = { success: sent > 0, edition, date, recipients: recipients.length, sent, failed, test: Boolean(testTo) };
  return json(body, sent > 0 ? 200 : 502);
}
