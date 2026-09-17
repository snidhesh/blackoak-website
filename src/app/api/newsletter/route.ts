// Step 1 of the Market Intelligence gate: validate the sign-up and email the
// visitor a 6-digit code. Nothing is unlocked and the team is not notified here;
// both happen in ./verify once the code proves the address is real.

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema, sanitizeUtm } from '@/lib/schemas';
import { sendVisitorEmail } from '@/lib/email';
import { renderVerificationEmail } from '@/lib/newsletter-email';
import { createChallenge, generateCode } from '@/lib/newsletter-token';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { FIELD_ERROR_CODES, FORM_ERROR_CODES } from '@/lib/error-codes';

const FIELD_CODE_MAP: Record<string, string> = {
  firstName: FIELD_ERROR_CODES.firstNameMin,
  lastName: FIELD_ERROR_CODES.lastNameMin,
  email: FIELD_ERROR_CODES.emailInvalid,
  consent: FIELD_ERROR_CODES.consentRequired,
};

function formError(code: string, status: number) {
  return NextResponse.json({ success: false, errors: [{ field: '_form', code }] }, { status });
}

export async function POST(request: NextRequest) {
  try {
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
    const code = generateCode();
    const signed = createChallenge(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        locale: data.locale,
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
