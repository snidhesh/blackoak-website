// Step 1 of the subscribe-to-unlock gate (Market Intelligence, Intelligence Hub):
// validate the sign-up and email the visitor a 6-digit code. Nothing is unlocked
// and the team is not notified here; both happen in ./verify once the code proves
// the address is real.

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema, sanitizeUtm } from '@/lib/schemas';
import { sendVisitorEmail } from '@/lib/email';
import { renderVerificationEmail } from '@/lib/newsletter-email';
import { createChallenge, generateCode } from '@/lib/newsletter-token';
import { hasAccessSecret } from '@/lib/access-cookie';
import { canonicalEmail, checkRateLimit, getClientIP, hashKey, isRateLimitConfigured } from '@/lib/rate-limit';
import { FIELD_ERROR_CODES, FORM_ERROR_CODES } from '@/lib/error-codes';

const FIELD_CODE_MAP: Record<string, string> = {
  firstName: FIELD_ERROR_CODES.firstNameMin,
  lastName: FIELD_ERROR_CODES.lastNameMin,
  email: FIELD_ERROR_CODES.emailInvalid,
  phone: FIELD_ERROR_CODES.phoneInvalid,
  consent: FIELD_ERROR_CODES.consentRequired,
};

function formError(code: string, status: number) {
  return NextResponse.json({ success: false, errors: [{ field: '_form', code }] }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // Fail closed before any work: without the access secret the verify step could
    // never unlock anything, so sending a code would only burn it.
    if (!hasAccessSecret()) {
      console.error('[api/newsletter] INTEL_ACCESS_SECRET is missing or too short');
      return formError(FORM_ERROR_CODES.submitFailed, 500);
    }
    // A verified code mints a long-lived access cookie, so the limits below are
    // not optional in production.
    if (process.env.NODE_ENV === 'production' && !isRateLimitConfigured()) {
      console.error('[api/newsletter] Upstash is not configured; refusing to issue codes without rate limits');
      return formError(FORM_ERROR_CODES.submitFailed, 503);
    }

    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'newsletter');
    if (!rateLimitResult.success) {
      return formError(FORM_ERROR_CODES.rateLimited, 429);
    }

    const body = await request.json();

    if (body._honeypot) {
      // Bots get a success with no challenge, so they have nothing to verify with.
      return NextResponse.json({ success: true });
    }

    const result = newsletterSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: FIELD_CODE_MAP[issue.path[0] as string] ?? FIELD_ERROR_CODES.emailInvalid,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const data = result.data;

    // Per address, whatever IPs the requests come from: caps inbox flooding and
    // the slow path to a fake "verified" lead.
    const emailLimit = await checkRateLimit(hashKey(canonicalEmail(data.email)), 'newsletter-email');
    if (!emailLimit.success) {
      return formError(FORM_ERROR_CODES.rateLimited, 429);
    }

    const code = generateCode();
    const signed = createChallenge(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone?.trim() || undefined,
        locale: data.locale,
        source: data.source,
        utm: sanitizeUtm(data.utm),
      },
      code
    );
    if (!signed) {
      return formError(FORM_ERROR_CODES.submitFailed, 500);
    }

    const email = renderVerificationEmail({ firstName: data.firstName, code, locale: data.locale });
    const emailResult = await sendVisitorEmail({ to: data.email, ...email, devConsoleFallback: true });

    if (!emailResult.success) {
      console.error('[api/newsletter] Verification email failed:', emailResult.error);
      return formError(FORM_ERROR_CODES.submitFailed, 502);
    }

    return NextResponse.json({ success: true, challenge: signed.challenge, expiresAt: signed.exp });
  } catch (error) {
    console.error('[api/newsletter] Error:', error);
    return formError(FORM_ERROR_CODES.unexpectedError, 500);
  }
}
