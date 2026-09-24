// Step 2 of the subscribe-to-unlock gate: check the emailed code against the signed
// challenge. Only a verified address reaches the team inbox, and only then does the
// browser get the access cookie that opens /briefing (the pages themselves unlock
// client-side).

import { NextRequest, NextResponse } from 'next/server';
import { newsletterVerifySchema } from '@/lib/schemas';
import { sendFormEmail, renderFieldsTable } from '@/lib/email';
import { verifyChallenge } from '@/lib/newsletter-token';
import { accessCookieOptions, createAccessToken, hasAccessSecret } from '@/lib/access-cookie';
import {
  checkRateLimit,
  claimChallenge,
  getClientIP,
  hashKey,
  isRateLimitConfigured,
  releaseChallenge,
} from '@/lib/rate-limit';
import { FORM_ERROR_CODES, NEWSLETTER_ERROR_CODES } from '@/lib/error-codes';
import { INTEL_ACCESS_COOKIE, type SubscribeSource } from '@/lib/constants';

const LOCALE_LABELS: Record<string, string> = { en: 'English', fr: 'French', ar: 'Arabic' };
const SOURCE_LABELS: Record<SubscribeSource, string> = {
  'market-intelligence': 'Market Intelligence',
  'intelligence-hub': 'Intelligence Hub',
};

function fail(field: '_form' | 'code', code: string, status: number) {
  return NextResponse.json({ success: false, errors: [{ field, code }] }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // Without the access secret a success here would send the visitor into a loop
    // between /briefing and the hub, emailing the team on every bounce. Stop first.
    if (!hasAccessSecret()) {
      console.error('[api/newsletter/verify] INTEL_ACCESS_SECRET is missing or too short');
      return fail('_form', FORM_ERROR_CODES.submitFailed, 500);
    }
    const production = process.env.NODE_ENV === 'production';
    if (production && !isRateLimitConfigured()) {
      console.error('[api/newsletter/verify] Upstash is not configured; refusing to verify without rate limits');
      return fail('_form', FORM_ERROR_CODES.submitFailed, 503);
    }

    // The rate limits are what make guessing a 6-digit code impractical: per IP,
    // and per challenge so rotating IPs does not help.
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'newsletter-verify');
    if (!rateLimitResult.success) {
      return fail('_form', FORM_ERROR_CODES.rateLimited, 429);
    }

    const parsed = newsletterVerifySchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail('code', NEWSLETTER_ERROR_CODES.codeInvalid, 400);
    }

    const challengeHash = hashKey(parsed.data.challenge);
    const challengeLimit = await checkRateLimit(challengeHash, 'newsletter-verify-challenge');
    if (!challengeLimit.success) {
      return fail('_form', FORM_ERROR_CODES.rateLimited, 429);
    }

    const verified = verifyChallenge(parsed.data.challenge, parsed.data.code);
    if (!verified.ok) {
      if (verified.reason === 'misconfigured') return fail('_form', FORM_ERROR_CODES.submitFailed, 500);
      return verified.reason === 'expired'
        ? fail('code', NEWSLETTER_ERROR_CODES.codeExpired, 410)
        : fail('code', NEWSLETTER_ERROR_CODES.codeInvalid, 400);
    }

    // Single use, claimed before the team email so two parallel requests cannot
    // both get through. An Upstash error is not "unused": fail closed in production.
    let claim: Awaited<ReturnType<typeof claimChallenge>>;
    try {
      claim = await claimChallenge(challengeHash, verified.payload.exp);
    } catch (error) {
      console.error('[api/newsletter/verify] Could not record the code as used:', error);
      if (production) return fail('_form', FORM_ERROR_CODES.submitFailed, 503);
      claim = 'skipped';
    }
    if (claim === 'used') {
      return fail('code', NEWSLETTER_ERROR_CODES.codeExpired, 410);
    }

    const { firstName, lastName, email, locale, source, utm } = verified.payload;
    const sourceLabel = (source && SOURCE_LABELS[source]) || SOURCE_LABELS['market-intelligence'];
    const fullName = `${firstName} ${lastName}`.trim();
    const utmRows: Array<[string, string | undefined]> = utm
      ? Object.entries(utm).map(([k, v]) => [`UTM ${k}`, v])
      : [];
    const table = renderFieldsTable([
      ['Name', fullName],
      ['Email', email],
      ['Email verified', 'Yes — confirmed with a one-time code'],
      ['Language', locale ? LOCALE_LABELS[locale] : undefined],
      ['Source', `${sourceLabel} — subscribe to unlock`],
      ['Consent', 'Agreed to receive market updates by email'],
      ...utmRows,
      ['Verified at', new Date().toISOString()],
    ]);
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111">
        <h2 style="margin:0 0 12px;font-size:18px">New ${sourceLabel} Subscriber</h2>
        ${table}
      </div>
    `;

    const emailResult = await sendFormEmail({
      subject: `${sourceLabel} subscriber — ${fullName}`,
      html,
      replyTo: email,
      devConsoleFallback: true,
    });

    if (!emailResult.success) {
      // Give the code back: it stays valid until it expires, so the visitor can retry.
      console.error('[api/newsletter/verify] Team notification failed:', emailResult.error);
      if (claim === 'claimed') await releaseChallenge(challengeHash).catch(() => undefined);
      return fail('_form', FORM_ERROR_CODES.submitFailed, 502);
    }

    const token = await createAccessToken();
    if (!token) return fail('_form', FORM_ERROR_CODES.submitFailed, 500);

    const response = NextResponse.json({ success: true });
    response.cookies.set(INTEL_ACCESS_COOKIE, token.value, accessCookieOptions(token.exp));
    return response;
  } catch (error) {
    console.error('[api/newsletter/verify] Error:', error);
    return fail('_form', FORM_ERROR_CODES.unexpectedError, 500);
  }
}
