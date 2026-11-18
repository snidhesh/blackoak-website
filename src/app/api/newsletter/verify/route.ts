// Step 2 of the subscribe-to-unlock gate: check the emailed code against the signed
// challenge. Only a verified address is saved as a subscriber, and only then does the
// browser get the access cookie that opens /briefing (the pages themselves unlock
// client-side).

import { NextRequest, NextResponse } from 'next/server';
import { newsletterVerifySchema } from '@/lib/schemas';
import { addSubscriberContact } from '@/lib/resend-contacts';
import { submitNewsletterCrmLead } from '@/lib/crm-lead';
import { sendWelcomeEmail } from '@/lib/newsletter-welcome-email';
import { verifyChallenge } from '@/lib/newsletter-token';
import { accessCookieOptions, createAccessToken, hasAccessSecret } from '@/lib/access-cookie';
import {
  checkRateLimit,
  claimChallenge,
  getClientIP,
  hashKey,
  isRateLimitConfigured,
} from '@/lib/rate-limit';
import { FORM_ERROR_CODES, NEWSLETTER_ERROR_CODES } from '@/lib/error-codes';
import { INTEL_ACCESS_COOKIE, SUBSCRIBE_SOURCE_LABELS } from '@/lib/constants';

function fail(field: '_form' | 'code', code: string, status: number) {
  return NextResponse.json({ success: false, errors: [{ field, code }] }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // Without the access secret a success here would send the visitor into a loop
    // between /briefing and the hub, filing a subscriber on every bounce. Stop first.
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

    // Single use, claimed before anything is saved so two parallel requests cannot
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

    const { firstName, lastName, email, phone, locale, source, utm } = verified.payload;
    const sourceLabel = (source && SUBSCRIBE_SOURCE_LABELS[source]) || SUBSCRIBE_SOURCE_LABELS['market-intelligence'];
    // Durable copies: the Resend contact list (what the Monday edition email is sent
    // to) and a CRM lead. The team is no longer emailed about each new subscriber.
    // Best-effort: the visitor has proved their address and gets in either way; a
    // failure here is logged for follow-up. The CRM receives a fixed dummy phone when
    // the visitor gave none (see CRM_DUMMY_PHONE).
    const [contactResult, crmResult] = await Promise.all([
      addSubscriberContact({ email, firstName, lastName }),
      submitNewsletterCrmLead({ firstName, lastName, email, phone, locale, sourceLabel, utm }),
    ]);
    if (!contactResult.success) {
      console.error('[api/newsletter/verify] Subscriber not saved to Resend contacts:', contactResult.error);
    }
    if (!crmResult.success) {
      console.error('[api/newsletter/verify] Subscriber not filed as a CRM lead:', crmResult.status);
    }
    // Welcome email, once: only for an address that was not already on the list.
    if (contactResult.created) await sendWelcomeEmail({ email, firstName, locale });

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
