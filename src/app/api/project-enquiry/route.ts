import { NextRequest, NextResponse } from 'next/server';
import { projectEnquirySchema, sanitizeUtm } from '@/lib/schemas';
import { submitCrmLead } from '@/lib/crm-lead';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { FIELD_ERROR_CODES, FORM_ERROR_CODES } from '@/lib/error-codes';

const FIELD_CODE_MAP: Record<string, string> = {
  firstName: FIELD_ERROR_CODES.firstNameMin,
  lastName: FIELD_ERROR_CODES.lastNameMin,
  phone: FIELD_ERROR_CODES.phoneInvalid,
  email: FIELD_ERROR_CODES.emailInvalid,
  message: FIELD_ERROR_CODES.messageMin,
  consent: FIELD_ERROR_CODES.consentRequired,
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'project-enquiry');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.rateLimited }] },
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
        code: FIELD_CODE_MAP[issue.path[0] as string] ?? FIELD_ERROR_CODES.firstNameMin,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const crmResult = await submitCrmLead({
      data: result.data,
      utm: sanitizeUtm(result.data.utm),
    });

    if (!crmResult.success) {
      console.error('[api/project-enquiry] CRM lead failed:', crmResult.status);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.submitFailed }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/project-enquiry] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.unexpectedError }] },
      { status: 500 }
    );
  }
}
