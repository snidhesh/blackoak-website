import { NextRequest, NextResponse } from 'next/server';
import { projectEnquirySchema } from '@/lib/schemas';
import { forwardToWebhook } from '@/lib/webhook';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'project-enquiry');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', message: 'Too many requests. Please try again later.' }] },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (body._honeypot) {
      return NextResponse.json({ success: true });
    }

    const result = projectEnquirySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const webhookResult = await forwardToWebhook({
      type: 'project-enquiry',
      data: result.data,
      timestamp: new Date().toISOString(),
    });

    if (!webhookResult.success) {
      console.error('[api/project-enquiry] Webhook failed:', webhookResult.error);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', message: 'Failed to submit. Please try again.' }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/project-enquiry] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', message: 'An unexpected error occurred.' }] },
      { status: 500 }
    );
  }
}
