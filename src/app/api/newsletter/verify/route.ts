// Step 2 of the Market Intelligence gate: check the emailed code against the signed
// challenge. Only a verified address reaches the team inbox, and only then does the
// browser unlock the page.

import { NextRequest, NextResponse } from 'next/server';
import { newsletterVerifySchema } from '@/lib/schemas';
import { sendFormEmail, renderFieldsTable } from '@/lib/email';
import { verifyChallenge } from '@/lib/newsletter-token';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { FORM_ERROR_CODES, NEWSLETTER_ERROR_CODES } from '@/lib/error-codes';

const LOCALE_LABELS: Record<string, string> = { en: 'English', fr: 'French', ar: 'Arabic' };

function fail(field: '_form' | 'code', code: string, status: number) {
  return NextResponse.json({ success: false, errors: [{ field, code }] }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // The rate limit is what makes guessing a 6-digit code impractical. It is only
    // active when Upstash is configured; see src/lib/rate-limit.ts.
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'newsletter-verify');
    if (!rateLimitResult.success) {
      return fail('_form', FORM_ERROR_CODES.rateLimited, 429);
    }

    const parsed = newsletterVerifySchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail('code', NEWSLETTER_ERROR_CODES.codeInvalid, 400);
    }

    const verified = verifyChallenge(parsed.data.challenge, parsed.data.code);
    if (!verified.ok) {
      if (verified.reason === 'misconfigured') return fail('_form', FORM_ERROR_CODES.submitFailed, 500);
      return verified.reason === 'expired'
        ? fail('code', NEWSLETTER_ERROR_CODES.codeExpired, 410)
        : fail('code', NEWSLETTER_ERROR_CODES.codeInvalid, 400);
    }

    const { firstName, lastName, email, locale, utm } = verified.payload;
    const fullName = `${firstName} ${lastName}`.trim();
    const utmRows: Array<[string, string | undefined]> = utm
      ? Object.entries(utm).map(([k, v]) => [`UTM ${k}`, v])
      : [];
    const table = renderFieldsTable([
      ['Name', fullName],
      ['Email', email],
      ['Email verified', 'Yes — confirmed with a one-time code'],
      ['Language', locale ? LOCALE_LABELS[locale] : undefined],
      ['Source', 'Market Intelligence — subscribe to unlock'],
      ['Consent', 'Agreed to receive market updates by email'],
      ...utmRows,
      ['Verified at', new Date().toISOString()],
    ]);
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111">
        <h2 style="margin:0 0 12px;font-size:18px">New Market Intelligence Subscriber</h2>
        ${table}
      </div>
    `;

    const emailResult = await sendFormEmail({
      subject: `Market Intelligence subscriber — ${fullName}`,
      html,
      replyTo: email,
      devConsoleFallback: true,
    });

    if (!emailResult.success) {
      // The code stays valid until it expires, so the visitor can simply retry.
      console.error('[api/newsletter/verify] Team notification failed:', emailResult.error);
      return fail('_form', FORM_ERROR_CODES.submitFailed, 502);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/newsletter/verify] Error:', error);
    return fail('_form', FORM_ERROR_CODES.unexpectedError, 500);
  }
}
