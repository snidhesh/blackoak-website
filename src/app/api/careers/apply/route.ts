import { NextRequest, NextResponse } from 'next/server';
import { careerApplicationSchema, MAX_CV_SIZE, ALLOWED_CV_TYPES, ALLOWED_CV_EXTENSIONS } from '@/lib/schemas';
import { sendFormEmail, renderFieldsTable, escapeHtml } from '@/lib/email';
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
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'careers-apply');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.rateLimited }] },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const honeypot = formData.get('_honeypot') as string;
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    const textData = {
      firstName: formData.get('firstName') as string || '',
      lastName: formData.get('lastName') as string || '',
      phone: formData.get('phone') as string || '',
      email: formData.get('email') as string || '',
      message: formData.get('message') as string || '',
      jobSlug: formData.get('jobSlug') as string || '',
      jobTitle: formData.get('jobTitle') as string || '',
      _honeypot: '',
    };

    const result = careerApplicationSchema.safeParse(textData);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: FIELD_CODE_MAP[issue.path[0] as string] ?? FIELD_ERROR_CODES.firstNameMin,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const cvFile = formData.get('cvFile') as File | null;
    if (cvFile && cvFile.size > 0) {
      if (cvFile.size > MAX_CV_SIZE) {
        return NextResponse.json(
          { success: false, errors: [{ field: 'cvFile', code: FIELD_ERROR_CODES.fileTooLarge }] },
          { status: 400 }
        );
      }

      const isValidType = ALLOWED_CV_TYPES.includes(cvFile.type);
      const ext = '.' + cvFile.name.split('.').pop()?.toLowerCase();
      const isValidExt = ALLOWED_CV_EXTENSIONS.includes(ext);

      if (!isValidType && !isValidExt) {
        return NextResponse.json(
          { success: false, errors: [{ field: 'cvFile', code: FIELD_ERROR_CODES.fileTypeInvalid }] },
          { status: 400 }
        );
      }
    }

    const data = result.data;
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const table = renderFieldsTable([
      ['Name', fullName],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Position', data.jobTitle],
      ['Slug', data.jobSlug],
      ['CV', cvFile && cvFile.size > 0 ? `${cvFile.name} (attached)` : 'Not provided'],
      ['Submitted', new Date().toISOString()],
    ]);
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111">
        <h2 style="margin:0 0 12px;font-size:18px">New Career Application</h2>
        ${table}
        <h3 style="margin:20px 0 6px;font-size:15px">Message</h3>
        <div style="white-space:pre-wrap;font-size:14px;line-height:1.5;color:#333">${escapeHtml(data.message)}</div>
      </div>
    `;

    const attachments = cvFile && cvFile.size > 0
      ? [{ filename: cvFile.name, content: Buffer.from(await cvFile.arrayBuffer()) }]
      : undefined;

    const emailResult = await sendFormEmail({
      subject: `Career Application — ${data.jobTitle} — ${fullName}`,
      html,
      replyTo: data.email,
      attachments,
    });

    if (!emailResult.success) {
      console.error('[api/careers/apply] Email send failed:', emailResult.error);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.submitFailed }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/careers/apply] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.unexpectedError }] },
      { status: 500 }
    );
  }
}
