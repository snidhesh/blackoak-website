import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/schemas';
import { forwardToWebhook } from '@/lib/webhook';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { FIELD_ERROR_CODES, FORM_ERROR_CODES } from '@/lib/error-codes';

const FIELD_CODE_MAP: Record<string, string> = {
  firstName: FIELD_ERROR_CODES.firstNameMin,
  lastName: FIELD_ERROR_CODES.lastNameMin,
  phone: FIELD_ERROR_CODES.phoneInvalid,
  email: FIELD_ERROR_CODES.emailInvalid,
  message: FIELD_ERROR_CODES.messageMin,
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'contact');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.rateLimited }] },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check
    if (body._honeypot) {
      // Silently accept but don't forward
      return NextResponse.json({ success: true });
    }

    // Validate
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: FIELD_CODE_MAP[issue.path[0] as string] ?? FIELD_ERROR_CODES.firstNameMin,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Forward to webhook
    const webhookResult = await forwardToWebhook({
      type: 'contact',
      data: result.data,
      timestamp: new Date().toISOString(),
    });

    if (!webhookResult.success) {
      console.error('[api/contact] Webhook failed:', webhookResult.error);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.submitFailed }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/contact] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.unexpectedError }] },
      { status: 500 }
    );
  }
}
