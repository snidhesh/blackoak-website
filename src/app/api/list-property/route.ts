import { NextRequest, NextResponse } from 'next/server';
import { listPropertySchema } from '@/lib/schemas';
import { sendFormEmail, renderFieldsTable, escapeHtml } from '@/lib/email';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { FIELD_ERROR_CODES, FORM_ERROR_CODES } from '@/lib/error-codes';

const FIELD_CODE_MAP: Record<string, string> = {
  firstName: FIELD_ERROR_CODES.firstNameMin,
  lastName: FIELD_ERROR_CODES.lastNameMin,
  phone: FIELD_ERROR_CODES.phoneInvalid,
  email: FIELD_ERROR_CODES.emailInvalid,
  message: FIELD_ERROR_CODES.messageMin,
  propertyType: FIELD_ERROR_CODES.selectPropertyType,
  bedrooms: FIELD_ERROR_CODES.selectBedrooms,
  listingType: FIELD_ERROR_CODES.selectListingType,
  location: FIELD_ERROR_CODES.enterLocation,
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'list-property');
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

    const result = listPropertySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: FIELD_CODE_MAP[issue.path[0] as string] ?? FIELD_ERROR_CODES.firstNameMin,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const data = result.data;
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const table = renderFieldsTable([
      ['Name', fullName],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Property Type', data.propertyType],
      ['Bedrooms', data.bedrooms],
      ['Listing Type', data.listingType],
      ['Location', data.location],
      ['Submitted', new Date().toISOString()],
    ]);
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111">
        <h2 style="margin:0 0 12px;font-size:18px">New Property Listing Request</h2>
        ${table}
        <h3 style="margin:20px 0 6px;font-size:15px">Message</h3>
        <div style="white-space:pre-wrap;font-size:14px;line-height:1.5;color:#333">${escapeHtml(data.message)}</div>
      </div>
    `;

    const emailResult = await sendFormEmail({
      subject: `List Property — ${data.propertyType} in ${data.location} — ${fullName}`,
      html,
      replyTo: data.email,
    });

    if (!emailResult.success) {
      console.error('[api/list-property] Email send failed:', emailResult.error);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.submitFailed }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/list-property] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.unexpectedError }] },
      { status: 500 }
    );
  }
}
