import { NextRequest, NextResponse } from 'next/server';
import { listPropertySchema } from '@/lib/schemas';
import { forwardToWebhook } from '@/lib/webhook';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'list-property');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', message: 'Too many requests. Please try again later.' }] },
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
    const result = listPropertySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Forward to webhook
    const webhookResult = await forwardToWebhook({
      type: 'list-property',
      data: result.data,
      timestamp: new Date().toISOString(),
    });

    if (!webhookResult.success) {
      console.error('[api/list-property] Webhook failed:', webhookResult.error);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', message: 'Failed to submit. Please try again.' }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/list-property] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', message: 'An unexpected error occurred.' }] },
      { status: 500 }
    );
  }
}
